import { ChatGPTSettings, ImageData, PromptSettings, UsageRecord } from '../types';
import { authService } from './authService';

export interface ChatGPTResponse {
  title: string;
  description: string;
  caption: string;
  altText: string;
}

export class ChatGPTService {
  private settings: ChatGPTSettings;

  // Precios por token para cada modelo (en USD)
  private static readonly MODEL_PRICING = {
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4.1': { input: 0.01, output: 0.03 },
    'o3': { input: 0.05, output: 0.15 },
    'o4-mini': { input: 0.00015, output: 0.0006 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
  };

  constructor(settings: ChatGPTSettings) {
    this.settings = settings;
  }

  private calculateCost(promptTokens: number, completionTokens: number, model: string): number {
    const pricing = ChatGPTService.MODEL_PRICING[model as keyof typeof ChatGPTService.MODEL_PRICING];
    if (!pricing) {
      console.warn(`Pricing not found for model: ${model}`);
      return 0;
    }
    
    const inputCost = (promptTokens / 1000) * pricing.input;
    const outputCost = (completionTokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  private saveUsageRecord(record: UsageRecord): void {
    try {
      const existing = localStorage.getItem('chatgpt-usage-history');
      const records: UsageRecord[] = existing ? JSON.parse(existing) : [];
      records.push(record);
      localStorage.setItem('chatgpt-usage-history', JSON.stringify(records));
    } catch (error) {
      console.error('Error saving usage record:', error);
    }
  }

  async generateImageDescription(imageData: ImageData, productDescription?: string, namePrefix?: string, promptSettings?: PromptSettings): Promise<ChatGPTResponse> {
    console.log('🔍 Iniciando generación de descripción para:', imageData.name);
    console.log('🔧 Configuración ChatGPT:', {
      enabled: this.settings.enabled,
      hasApiKey: !!this.settings.apiKey,
      model: this.settings.model
    });

    if (!this.settings.enabled || !this.settings.apiKey) {
      throw new Error('ChatGPT no está configurado o habilitado');
    }

    try {
      // Convertir la imagen a base64 para enviarla a la API
      console.log('🖼️ Convirtiendo imagen a base64...');
      const base64Image = await this.convertImageToBase64(imageData.url);
      console.log('✅ Imagen convertida a base64, tamaño:', base64Image.length, 'caracteres');
      
      // Usar prompts personalizados o predeterminados
      const prompts = promptSettings?.useCustomPrompts ? promptSettings : {
        titlePrompt: "Genera un título atractivo y descriptivo para esta imagen (máximo 60 caracteres). El título debe ser claro, conciso y que capture la esencia del producto mostrado.",
        descriptionPrompt: "Describe detalladamente lo que ves en esta imagen. Incluye características visuales, colores, materiales, estilo y cualquier detalle relevante del producto (2-3 oraciones).",
        captionPrompt: "Crea una leyenda corta y atractiva para esta imagen que resalte las características principales del producto (1 oración).",
        altTextPrompt: "Genera un texto alternativo descriptivo para accesibilidad que describa claramente el contenido de la imagen (máximo 125 caracteres)."
      };

      let prompt = `Analiza esta imagen específica y proporciona la descripción en el siguiente formato exacto:

================================================================================
*Texto alternativo*: [${prompts.altTextPrompt}]
*Título*: [${prompts.titlePrompt}]
*Leyenda*: [${prompts.captionPrompt}]
*Descripción*: [${prompts.descriptionPrompt}]
================================================================================

IMPORTANTE: Responde ÚNICAMENTE con el formato mostrado arriba, reemplazando los corchetes con el contenido generado. NO uses formato JSON, NO agregues texto adicional, NO uses comillas.`;

      // Agregar contexto del producto como información adicional (no como parte del prompt)
      if (productDescription && productDescription.trim()) {
        prompt += `\n\nCONTEXTO ADICIONAL DEL PRODUCTO: ${productDescription}`;
      }

      if (namePrefix && namePrefix.trim()) {
        prompt += `\n\nPREFIJO DEL PRODUCTO: ${namePrefix}`;
      }

      if ((productDescription && productDescription.trim()) || (namePrefix && namePrefix.trim())) {
        prompt += `\n\nUsa esta información de contexto para generar contenido más preciso, pero enfócate en describir específicamente lo que ves en esta imagen particular.`;
      }

      console.log('🚀 Enviando solicitud a OpenAI API...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      console.log('📡 Respuesta recibida, status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error de API:', errorData);
        throw new Error(`Error de API: ${errorData.error?.message || 'Error desconocido'}`);
      }

      const data = await response.json();
      console.log('✅ Datos recibidos de OpenAI:', data);
      const content = data.choices[0]?.message?.content;
      console.log('📝 Contenido de la respuesta:', content);

      if (!content) {
        throw new Error('No se recibió respuesta de ChatGPT');
      }

            // Extraer información de uso de la respuesta
            const usage = data.usage;
            const promptTokens = usage?.prompt_tokens || 0;
            const completionTokens = usage?.completion_tokens || 0;
            const totalTokens = usage?.total_tokens || (promptTokens + completionTokens);
            const cost = this.calculateCost(promptTokens, completionTokens, this.settings.model);

            // Guardar registro de uso
            const currentUser = authService.getCurrentUser();
            const usageRecord: UsageRecord = {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              model: this.settings.model,
              imageName: `${currentUser?.username || 'unknown'}_${imageData.name}`,
              promptTokens,
              completionTokens,
              totalTokens,
              cost,
              success: true
            };
            this.saveUsageRecord(usageRecord);

            // Intentar parsear el JSON de la respuesta
            try {
              console.log('🔍 Intentando parsear como JSON...');
              const parsedResponse = JSON.parse(content);
              console.log('✅ Parseado como JSON exitosamente:', parsedResponse);
              return {
                title: parsedResponse.title || 'Título no disponible',
                description: parsedResponse.description || 'Descripción no disponible',
                caption: parsedResponse.caption || 'Leyenda no disponible',
                altText: parsedResponse.altText || 'Texto alternativo no disponible'
              };
            } catch (parseError) {
              console.log('⚠️ No es JSON válido, parseando como texto...');
              // Si no es JSON válido, extraer información del texto
              const result = this.parseTextResponse(content);
              console.log('✅ Parseado como texto:', result);
              return result;
            }

    } catch (error) {
      console.error('Error generando descripción:', error);
      
      // Guardar registro de error
      const currentUser = authService.getCurrentUser();
      const errorRecord: UsageRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        model: this.settings.model,
        imageName: `${currentUser?.username || 'unknown'}_${imageData.name}`,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
      this.saveUsageRecord(errorRecord);
      
      throw error;
    }
  }

  private async convertImageToBase64(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        try {
          const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          resolve(base64);
        } catch (error) {
          reject(new Error('Error convirtiendo imagen a base64'));
        }
      };
      
      img.onerror = () => {
        reject(new Error('Error cargando imagen'));
      };
      
      img.src = imageUrl;
    });
  }

  private parseTextResponse(text: string): ChatGPTResponse {
    // Extraer información del texto con el nuevo formato
    const lines = text.split('\n').filter(line => line.trim());
    
    let title = 'Título no disponible';
    let description = 'Descripción no disponible';
    let caption = 'Leyenda no disponible';
    let altText = 'Texto alternativo no disponible';
    
    // Buscar cada campo por su patrón
    for (const line of lines) {
      if (line.includes('*Texto alternativo*:')) {
        altText = line.replace('*Texto alternativo*:', '').trim();
      } else if (line.includes('*Título*:')) {
        title = line.replace('*Título*:', '').trim();
      } else if (line.includes('*Leyenda*:')) {
        caption = line.replace('*Leyenda*:', '').trim();
      } else if (line.includes('*Descripción*:')) {
        description = line.replace('*Descripción*:', '').trim();
      }
    }
    
    return {
      title,
      description,
      caption,
      altText
    };
  }

  async testConnection(): Promise<boolean> {
    if (!this.settings.apiKey) {
      return false;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.settings.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error probando conexión:', error);
      return false;
    }
  }

  async testImageAnalysis(imageData: ImageData): Promise<boolean> {
    if (!this.settings.enabled || !this.settings.apiKey) {
      return false;
    }

    try {
      const base64Image = await this.convertImageToBase64(imageData.url);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Describe brevemente lo que ves en esta imagen.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error probando análisis de imagen:', error);
      return false;
    }
  }
}
