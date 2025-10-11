interface CurrencySettings {
  enabled: boolean;
  updateInterval: number; // en minutos
  country: string;
  baseCurrency: string;
}

interface ExchangeRates {
  [currency: string]: number;
}

class CurrencyService {
  private settings: CurrencySettings | null = null;
  private exchangeRates: ExchangeRates = {};
  private lastUpdate: Date | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadSettings();
    this.startAutoUpdate();
  }

  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('currency-settings');
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
        if (this.settings?.enabled) {
          this.fetchExchangeRates();
        }
      } else {
        // Configuración por defecto
        this.settings = {
          enabled: false,
          updateInterval: 60,
          country: 'US',
          baseCurrency: 'USD'
        };
      }
    } catch (error) {
      console.error('Error loading currency settings:', error);
      this.settings = {
        enabled: false,
        updateInterval: 60,
        country: 'US',
        baseCurrency: 'USD'
      };
    }
  }

  private async fetchExchangeRates(): Promise<void> {
    if (!this.settings?.enabled) {
      return;
    }

    try {
      // Usar ChatGPT para obtener tasas de cambio actuales
      const chatGPTResponse = await this.getExchangeRatesFromChatGPT();
      
      if (chatGPTResponse) {
        this.exchangeRates = chatGPTResponse;
        this.lastUpdate = new Date();
        
        // Guardar en localStorage para uso offline
        localStorage.setItem('exchange-rates', JSON.stringify({
          rates: this.exchangeRates,
          lastUpdate: this.lastUpdate.toISOString()
        }));

        console.log('Exchange rates updated successfully via ChatGPT:', Object.keys(this.exchangeRates).length, 'currencies');
      } else {
        console.error('Failed to fetch exchange rates from ChatGPT');
        this.loadOfflineRates();
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      this.loadOfflineRates();
    }
  }

  private async getExchangeRatesFromChatGPT(): Promise<ExchangeRates | null> {
    try {
      // Obtener configuración de ChatGPT del localStorage
      const chatGPTSettings = localStorage.getItem('chatgpt-settings');
      if (!chatGPTSettings) {
        console.error('No ChatGPT settings found');
        return null;
      }

      const settings = JSON.parse(chatGPTSettings);
      if (!settings.apiKey) {
        console.error('No ChatGPT API key found');
        return null;
      }

      // Prompt para ChatGPT que solicita tasas de cambio actuales
      const prompt = `Proporciona las tasas de cambio EXACTAS y ACTUALIZADAS de ${this.settings?.baseCurrency || 'USD'} a las siguientes monedas en formato JSON. País de ubicación: ${this.settings?.country || 'US'}.

      IMPORTANTE: 
      - Usa datos financieros REALES y ACTUALES
      - Para COP (peso colombiano): 1 USD ≈ 3,900 COP (NO 4,000)
      - Para MXN (peso mexicano): 1 USD ≈ 18.5 MXN
      - Para ARS (peso argentino): 1 USD ≈ 850 ARS
      - Sé PRECISO con las tasas de cambio latinoamericanas
      - Usa datos de mercados financieros actuales

      {
        "${this.settings?.baseCurrency || 'USD'}": 1,
        "EUR": [tasa_exacta],
        "GBP": [tasa_exacta],
        "JPY": [tasa_exacta],
        "MXN": [tasa_exacta],
        "CAD": [tasa_exacta],
        "AUD": [tasa_exacta],
        "CHF": [tasa_exacta],
        "CNY": [tasa_exacta],
        "BRL": [tasa_exacta],
        "COP": [tasa_exacta_aprox_3900],
        "ARS": [tasa_exacta],
        "CLP": [tasa_exacta],
        "PEN": [tasa_exacta],
        "UYU": [tasa_exacta],
        "BOB": [tasa_exacta],
        "PYG": [tasa_exacta],
        "VES": [tasa_exacta],
        "KRW": [tasa_exacta],
        "SGD": [tasa_exacta],
        "HKD": [tasa_exacta],
        "NZD": [tasa_exacta],
        "SEK": [tasa_exacta],
        "NOK": [tasa_exacta],
        "DKK": [tasa_exacta],
        "PLN": [tasa_exacta],
        "CZK": [tasa_exacta],
        "HUF": [tasa_exacta],
        "RON": [tasa_exacta],
        "BGN": [tasa_exacta],
        "HRK": [tasa_exacta],
        "RUB": [tasa_exacta],
        "TRY": [tasa_exacta],
        "INR": [tasa_exacta],
        "IDR": [tasa_exacta],
        "THB": [tasa_exacta],
        "MYR": [tasa_exacta],
        "PHP": [tasa_exacta],
        "ILS": [tasa_exacta],
        "ZAR": [tasa_exacta],
        "ISK": [tasa_exacta]
      }
      
      Solo responde con el JSON válido, sin texto adicional. Usa tasas de cambio REALES y ACTUALES.`;

      // Llamada real a la API de ChatGPT
      const response = await this.callChatGPTAPI(settings.apiKey, prompt);
      
      if (response) {
        try {
          // Limpiar la respuesta para extraer solo el JSON
          const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const rates = JSON.parse(cleanResponse);
          
          // Validar y corregir tasas específicas si es necesario
          const correctedRates = this.validateAndCorrectRates(rates);
          
          return correctedRates;
        } catch (parseError) {
          console.error('Error parsing ChatGPT response:', parseError);
          console.error('Raw response:', response);
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error calling ChatGPT for exchange rates:', error);
      return null;
    }
  }

  private async callChatGPTAPI(apiKey: string, prompt: string): Promise<string | null> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto financiero especializado en tasas de cambio de monedas. Proporciona tasas de cambio EXACTAS y ACTUALIZADAS basadas en datos financieros reales. Es crucial que las tasas sean precisas, especialmente para monedas latinoamericanas como COP, MXN, ARS, etc. Usa datos de mercados financieros actuales.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.05
        })
      });

      if (!response.ok) {
        console.error('ChatGPT API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      return null;
    }
  }

  private validateAndCorrectRates(rates: ExchangeRates): ExchangeRates {
    const correctedRates = { ...rates };
    
    // Validar y corregir tasas específicas conocidas
    const expectedRanges = {
      'COP': { min: 3500, max: 4200, expected: 3900 }, // Peso colombiano
      'MXN': { min: 17, max: 20, expected: 18.5 },     // Peso mexicano
      'ARS': { min: 800, max: 900, expected: 850 },    // Peso argentino
      'BRL': { min: 5, max: 6, expected: 5.5 },        // Real brasileño
      'CLP': { min: 900, max: 1000, expected: 950 },   // Peso chileno
      'PEN': { min: 3.5, max: 4.0, expected: 3.8 },    // Sol peruano
    };
    
    for (const [currency, range] of Object.entries(expectedRanges)) {
      if (correctedRates[currency]) {
        const rate = correctedRates[currency];
        
        // Si la tasa está fuera del rango esperado, usar el valor esperado
        if (rate < range.min || rate > range.max) {
          console.warn(`Tasa de ${currency} fuera de rango (${rate}). Usando valor esperado: ${range.expected}`);
          correctedRates[currency] = range.expected;
        }
      }
    }
    
    return correctedRates;
  }

  private loadOfflineRates(): void {
    try {
      const savedRates = localStorage.getItem('exchange-rates');
      if (savedRates) {
        const { rates, lastUpdate } = JSON.parse(savedRates);
        this.exchangeRates = rates;
        this.lastUpdate = new Date(lastUpdate);
        console.log('Loaded offline exchange rates from', this.lastUpdate);
      } else {
        this.loadDefaultRates();
      }
    } catch (error) {
      console.error('Error loading offline rates:', error);
      this.loadDefaultRates();
    }
  }

  private loadDefaultRates(): void {
    // Tasas de cambio simuladas como fallback
    this.exchangeRates = {
      'USD': 1,
      'EUR': 0.8601,
      'GBP': 0.7487,
      'JPY': 151.1850,
      'MXN': 18.5962,
      'CAD': 1.4003,
      'AUD': 1.5443,
      'CHF': 0.7993,
      'CNY': 7.1340,
      'BRL': 5.5023,
      'COP': 3900, // Tasa simulada para Colombia (1 USD ≈ 3,900 COP)
      'ARS': 850,  // Tasa simulada para Argentina
      'CLP': 950,  // Tasa simulada para Chile
      'PEN': 3.8,  // Tasa simulada para Perú
      'UYU': 42,   // Tasa simulada para Uruguay
      'BOB': 6.9,  // Tasa simulada para Bolivia
      'PYG': 7300, // Tasa simulada para Paraguay
      'VES': 36.2, // Tasa simulada para Venezuela
      'KRW': 1426.7351,
      'SGD': 1.2968,
      'HKD': 7.7826,
      'NZD': 1.7475,
      'SEK': 9.5056,
      'NOK': 10.1184,
      'DKK': 6.4266,
      'PLN': 3.6683,
      'CZK': 20.9265,
      'HUF': 337.7001,
      'RON': 4.3812,
      'BGN': 1.6832,
      'HRK': 6.4857,
      'RUB': 81.6300,
      'TRY': 41.8153,
      'INR': 88.7467,
      'IDR': 16584.0031,
      'THB': 32.6700,
      'MYR': 4.2250,
      'PHP': 58.2820,
      'ILS': 3.3058,
      'ZAR': 17.5073,
      'ISK': 121.8600
    };
    this.lastUpdate = new Date();
    console.log('Using default exchange rates');
  }

  private startAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (this.settings?.enabled && this.settings?.updateInterval) {
      const intervalMs = this.settings.updateInterval * 60 * 1000; // Convertir minutos a milisegundos
      
      this.updateInterval = setInterval(() => {
        this.fetchExchangeRates();
      }, intervalMs);

      console.log(`Auto-update started: every ${this.settings.updateInterval} minutes`);
    }
  }

  public updateSettings(newSettings: CurrencySettings): void {
    this.settings = newSettings;
    this.startAutoUpdate();
    
    if (newSettings.enabled) {
      this.fetchExchangeRates();
    }
  }

  public getExchangeRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    // Si tenemos tasas reales de la API
    if (this.exchangeRates[toCurrency] && this.exchangeRates[fromCurrency]) {
      // Convertir desde la moneda base a la moneda objetivo
      return this.exchangeRates[toCurrency] / this.exchangeRates[fromCurrency];
    }

    // Fallback a tasas simuladas
    const simulatedRates: { [key: string]: number } = {
      'USD': 1,
      'EUR': 0.8601,
      'GBP': 0.7487,
      'JPY': 151.1850,
      'MXN': 18.5962,
      'CAD': 1.4003,
      'AUD': 1.5443,
      'CHF': 0.7993,
      'CNY': 7.1340,
      'BRL': 5.5023,
      'COP': 3900,
      'ARS': 850,
      'CLP': 950,
      'PEN': 3.8,
      'UYU': 42,
      'BOB': 6.9,
      'PYG': 7300,
      'VES': 36.2,
      'KRW': 1426.7351,
      'SGD': 1.2968,
      'HKD': 7.7826,
      'NZD': 1.7475,
      'SEK': 9.5056,
      'NOK': 10.1184,
      'DKK': 6.4266,
      'PLN': 3.6683,
      'CZK': 20.9265,
      'HUF': 337.7001,
      'RON': 4.3812,
      'BGN': 1.6832,
      'HRK': 6.4857,
      'RUB': 81.6300,
      'TRY': 41.8153,
      'INR': 88.7467,
      'IDR': 16584.0031,
      'THB': 32.6700,
      'MYR': 4.2250,
      'PHP': 58.2820,
      'ILS': 3.3058,
      'ZAR': 17.5073,
      'ISK': 121.8600
    };

    if (simulatedRates[toCurrency] && simulatedRates[fromCurrency]) {
      return simulatedRates[toCurrency] / simulatedRates[fromCurrency];
    }

    return 1; // Fallback final
  }

  public convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  public getLastUpdate(): Date | null {
    return this.lastUpdate;
  }

  public getAvailableCurrencies(): string[] {
    return Object.keys(this.exchangeRates);
  }

  public isUsingRealRates(): boolean {
    return this.settings?.enabled === true;
  }

  public getBaseCurrency(): string {
    return this.settings?.baseCurrency || 'USD';
  }

  public forceUpdate(): Promise<void> {
    return this.fetchExchangeRates();
  }
}

export const currencyService = new CurrencyService();
