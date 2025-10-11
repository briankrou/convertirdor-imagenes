import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Brain, Settings, CheckCircle, XCircle, Info, Trash2, RefreshCw } from 'lucide-react';
import { Popup } from './Popup';
import { usePopup } from '../hooks/usePopup';
import { currencyService } from '../services/currencyService';

interface CurrencySettings {
  enabled: boolean;
  updateInterval: number; // en minutos
  country: string;
  baseCurrency: string;
}

interface CurrencyAPIConfigProps {
  onBack: () => void;
}

export const CurrencyAPIConfig: React.FC<CurrencyAPIConfigProps> = ({ onBack }) => {
  const [updateInterval, setUpdateInterval] = useState(60);
  const [enabled, setEnabled] = useState(false);
  const [country, setCountry] = useState('US');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [sampleRates, setSampleRates] = useState<{[key: string]: number} | null>(null);
  const { popupState, hidePopup, showConfirm, showAlert } = usePopup();

  // Cargar configuración existente
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('currency-settings');
      if (savedSettings) {
        const settings: CurrencySettings = JSON.parse(savedSettings);
        setUpdateInterval(settings.updateInterval);
        setEnabled(settings.enabled);
        setCountry(settings.country || 'US');
        setBaseCurrency(settings.baseCurrency || 'USD');
      }
    } catch (error) {
      console.error('Error loading currency settings:', error);
    }
  };

  const handleSave = useCallback(async () => {
    try {
      const settings: CurrencySettings = {
        updateInterval,
        enabled,
        country,
        baseCurrency
      };

      localStorage.setItem('currency-settings', JSON.stringify(settings));
      currencyService.updateSettings(settings);
      showAlert('Configuración guardada', 'La configuración de conversión de monedas ha sido guardada correctamente.', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('Error', 'No se pudo guardar la configuración.', 'error');
    }
  }, [updateInterval, enabled, country, baseCurrency, showAlert]);

  const handleClear = () => {
    showConfirm(
      'Limpiar configuración',
      '¿Estás seguro de que quieres limpiar toda la configuración de conversión de monedas? Esta acción restablecerá todos los valores a los predeterminados.',
      () => {
        setUpdateInterval(60);
        setEnabled(false);
        setCountry('US');
        setBaseCurrency('USD');
        setTestStatus('idle');
        setTestMessage('');
        setSampleRates(null);
        localStorage.removeItem('currency-settings');
        currencyService.updateSettings({ enabled: false, updateInterval: 60, country: 'US', baseCurrency: 'USD' });
        showAlert('Configuración limpiada', 'La configuración ha sido restablecida a los valores predeterminados.', 'success');
      },
      {
        confirmText: 'Limpiar',
        cancelText: 'Cancelar',
        type: 'warning'
      }
    );
  };

  const handleTestAPI = useCallback(async () => {
    setIsTesting(true);
    setTestStatus('idle');
    setTestMessage('');

    try {
      // Probar la obtención de tasas de cambio via ChatGPT
      await currencyService.forceUpdate();
      const availableCurrencies = currencyService.getAvailableCurrencies();
      
      if (availableCurrencies.length > 0) {
        setTestStatus('success');
        setTestMessage(`Conexión exitosa. Se obtuvieron tasas de cambio para ${availableCurrencies.length} monedas via ChatGPT.`);
        
        // Mostrar algunas tasas de muestra
        const sampleRates: {[key: string]: number} = {};
        ['EUR', 'GBP', 'JPY', 'MXN', 'COP'].forEach(currency => {
          if (availableCurrencies.includes(currency)) {
            sampleRates[currency] = currencyService.getExchangeRate('USD', currency);
          }
        });
        setSampleRates(sampleRates);
      } else {
        setTestStatus('error');
        setTestMessage('No se pudieron obtener tasas de cambio. Verifica la conexión.');
        setSampleRates(null);
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage(`Error inesperado: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Currency test error:', error);
      setSampleRates(null);
    } finally {
      setIsTesting(false);
    }
  }, []);

  const countries = [
    { code: 'US', name: 'Estados Unidos', currency: 'USD' },
    { code: 'MX', name: 'México', currency: 'MXN' },
    { code: 'ES', name: 'España', currency: 'EUR' },
    { code: 'GB', name: 'Reino Unido', currency: 'GBP' },
    { code: 'CA', name: 'Canadá', currency: 'CAD' },
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'JP', name: 'Japón', currency: 'JPY' },
    { code: 'CN', name: 'China', currency: 'CNY' },
    { code: 'BR', name: 'Brasil', currency: 'BRL' },
    { code: 'AR', name: 'Argentina', currency: 'ARS' },
    { code: 'CL', name: 'Chile', currency: 'CLP' },
    { code: 'CO', name: 'Colombia', currency: 'COP' },
    { code: 'PE', name: 'Perú', currency: 'PEN' },
    { code: 'UY', name: 'Uruguay', currency: 'UYU' },
    { code: 'BO', name: 'Bolivia', currency: 'BOB' },
    { code: 'PY', name: 'Paraguay', currency: 'PYG' },
    { code: 'VE', name: 'Venezuela', currency: 'VES' },
    { code: 'KR', name: 'Corea del Sur', currency: 'KRW' },
    { code: 'SG', name: 'Singapur', currency: 'SGD' },
    { code: 'HK', name: 'Hong Kong', currency: 'HKD' },
    { code: 'NZ', name: 'Nueva Zelanda', currency: 'NZD' },
    { code: 'SE', name: 'Suecia', currency: 'SEK' },
    { code: 'NO', name: 'Noruega', currency: 'NOK' },
    { code: 'DK', name: 'Dinamarca', currency: 'DKK' },
    { code: 'PL', name: 'Polonia', currency: 'PLN' },
    { code: 'CZ', name: 'República Checa', currency: 'CZK' },
    { code: 'HU', name: 'Hungría', currency: 'HUF' },
    { code: 'RO', name: 'Rumania', currency: 'RON' },
    { code: 'BG', name: 'Bulgaria', currency: 'BGN' },
    { code: 'HR', name: 'Croacia', currency: 'HRK' },
    { code: 'RU', name: 'Rusia', currency: 'RUB' },
    { code: 'TR', name: 'Turquía', currency: 'TRY' },
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'ID', name: 'Indonesia', currency: 'IDR' },
    { code: 'TH', name: 'Tailandia', currency: 'THB' },
    { code: 'MY', name: 'Malasia', currency: 'MYR' },
    { code: 'PH', name: 'Filipinas', currency: 'PHP' },
    { code: 'IL', name: 'Israel', currency: 'ILS' },
    { code: 'ZA', name: 'Sudáfrica', currency: 'ZAR' },
    { code: 'IS', name: 'Islandia', currency: 'ISK' }
  ];

  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = countries.find(c => c.code === countryCode);
    if (selectedCountry) {
      setCountry(countryCode);
      setBaseCurrency(selectedCountry.currency);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Volver</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Brain className="w-6 h-6 mr-2" />
          Configuración de Conversión de Monedas
        </h1>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* ChatGPT Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Configuración de ChatGPT
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">¿Cómo funciona?</h3>
                <p className="text-sm text-blue-800">
                  El sistema utiliza ChatGPT para obtener tasas de cambio actuales de USD a múltiples monedas. 
                  No requiere configuración de API externa, solo habilita la función y ChatGPT se encargará de proporcionar las tasas más actualizadas.
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  id="enabled"
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
                  Habilitar conversión de monedas via ChatGPT
                </label>
              </div>
            </div>
          </div>

          {/* Location Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración de Ubicación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  País de Ubicación
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.currency})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Se utiliza para obtener tasas de cambio más precisas
                </p>
              </div>
              
              <div>
                <label htmlFor="baseCurrency" className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda Base
                </label>
                <input
                  id="baseCurrency"
                  type="text"
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ej. USD"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se actualiza automáticamente al seleccionar el país
                </p>
              </div>
            </div>
          </div>

          {/* Update Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración de Actualización
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="updateInterval" className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalo de Actualización (minutos)
                </label>
                <select
                  id="updateInterval"
                  value={updateInterval}
                  onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={240}>4 horas</option>
                  <option value={720}>12 horas</option>
                  <option value={1440}>24 horas</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Frecuencia de actualización de las tasas de cambio via ChatGPT
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Acciones
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Guardar Configuración</span>
              </button>
              <button
                onClick={handleTestAPI}
                disabled={isTesting}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isTesting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{isTesting ? 'Probando...' : 'Probar Conversión'}</span>
              </button>
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpiar Configuración</span>
              </button>
            </div>

            {testStatus !== 'idle' && (
              <div className={`mt-4 p-3 rounded-lg ${testStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center space-x-2">
                  {testStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <p className={`text-sm ${testStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>{testMessage}</p>
                </div>
                
                {testStatus === 'success' && sampleRates && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Tasas de cambio de muestra (base: USD) via ChatGPT:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(sampleRates).map(([currency, rate]) => (
                        <div key={currency} className="flex justify-between">
                          <span className="text-green-700">{currency}:</span>
                          <span className="text-green-600 font-mono">{rate.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      Fuente: <code className="bg-green-100 px-1 rounded">ChatGPT</code>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Información de Ayuda
            </h2>
            <div className="space-y-4 text-gray-700 text-sm">
              <p>
                <strong>ChatGPT</strong> se utiliza para obtener tasas de cambio EXACTAS y ACTUALIZADAS de USD a múltiples monedas de forma automática. 
                El sistema usa el modelo GPT-4o con validación específica para monedas latinoamericanas.
              </p>
              <div>
                <h3 className="font-medium mb-2">Pasos para configurar:</h3>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Selecciona tu país de ubicación</li>
                  <li>Verifica que la moneda base sea correcta</li>
                  <li>Habilita la conversión de monedas via ChatGPT</li>
                  <li>Configura el intervalo de actualización deseado</li>
                  <li>Haz clic en "Probar Conversión" para verificar el funcionamiento</li>
                  <li>Guarda la configuración</li>
                </ol>
              </div>
              <div>
                <h3 className="font-medium mb-2">Características:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Usa modelo GPT-4o para máxima precisión</li>
                  <li>Validación automática de tasas latinoamericanas</li>
                  <li>Corrección automática de tasas incorrectas</li>
                  <li>Actualización automática según intervalo configurado</li>
                  <li>Soporte para más de 40 monedas principales</li>
                  <li>Contexto de país para tasas más precisas</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Monedas Soportadas:</h3>
                <div className="bg-gray-100 p-3 rounded-lg text-xs">
                  <p>USD, EUR, GBP, JPY, MXN, CAD, AUD, CHF, CNY, BRL, COP, ARS, CLP, PEN, UYU, BOB, PYG, VES, KRW, SGD, HKD, NZD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, HRK, RUB, TRY, INR, IDR, THB, MYR, PHP, ILS, ZAR, ISK</p>
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>Precisión Garantizada:</strong> El sistema valida y corrige automáticamente tasas incorrectas. 
                  Por ejemplo, si ChatGPT devuelve 4,000 COP por USD, se corrige automáticamente a 3,900 COP (valor real).
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  <strong>Ventaja:</strong> No necesitas configurar APIs externas. ChatGPT se encarga de proporcionar las tasas de cambio más actualizadas automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      <Popup
        isOpen={popupState.isOpen}
        onClose={hidePopup}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        onConfirm={popupState.onConfirm}
        onCancel={popupState.onCancel}
        confirmText={popupState.confirmText}
        cancelText={popupState.cancelText}
        showButtons={popupState.showButtons}
      />
    </div>
  );
};
