import React, { useState } from 'react';
import { ArrowLeft, Key, Brain, CheckCircle, XCircle, Eye, EyeOff, Trash2 } from 'lucide-react';
import { UserChatGPTSettings } from '../types';

interface ChatGPTConfigProps {
  settings: UserChatGPTSettings;
  onSettingsChange: (settings: UserChatGPTSettings) => void;
  onClearSettings: () => void;
  onBack: () => void;
}

export const ChatGPTConfig: React.FC<ChatGPTConfigProps> = ({
  settings,
  onSettingsChange,
  onClearSettings,
  onBack
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isTestingImage, setIsTestingImage] = useState(false);
  const [imageTestResult, setImageTestResult] = useState<string>('');

  const modelOptions = [
    { 
      value: 'gpt-4o' as const, 
      label: 'GPT-4o (Omni)', 
      description: 'Modelo multimodal más avanzado con visión robusta',
      price: 'Recomendado'
    },
    { 
      value: 'gpt-4o-mini' as const, 
      label: 'GPT-4o Mini', 
      description: 'Versión ligera con capacidades visuales optimizadas',
      price: 'Económico'
    },
    { 
      value: 'gpt-4-turbo' as const, 
      label: 'GPT-4 Turbo', 
      description: 'Versión optimizada de GPT-4 con visión',
      price: 'Precio medio'
    },
    { 
      value: 'gpt-4.1' as const, 
      label: 'GPT-4.1', 
      description: 'Familia GPT-4.1 con versiones de visión',
      price: 'Precio medio'
    },
    { 
      value: 'o3' as const, 
      label: 'o3', 
      description: 'Modelo de razonamiento avanzado con análisis visual profundo',
      price: 'Premium'
    }
  ];

  const handleModelChange = (model: UserChatGPTSettings['model']) => {
    onSettingsChange({ ...settings, model });
  };

  const handleClearSettings = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar tu configuración de ChatGPT? Esta acción restablecerá todos los valores a los predeterminados.')) {
      onClearSettings();
    }
  };

  const handleApiKeyChange = (apiKey: string) => {
    onSettingsChange({ ...settings, apiKey });
    setConnectionStatus('idle');
  };

  const handleEnabledChange = (enabled: boolean) => {
    onSettingsChange({ ...settings, enabled });
  };

  const testConnection = async () => {
    if (!settings.apiKey.trim()) {
      setConnectionStatus('error');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`
        }
      });

      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testImageAnalysis = async () => {
    if (!settings.apiKey.trim()) {
      setImageTestResult('❌ API key no configurada');
      return;
    }

    setIsTestingImage(true);
    setImageTestResult('');

    try {
      // Crear una imagen de prueba simple
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setImageTestResult('❌ No se pudo crear contexto de canvas');
        return;
      }

      // Dibujar un rectángulo simple
      ctx.fillStyle = '#4F46E5';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Imagen de Prueba', 100, 100);

      const testImageUrl = canvas.toDataURL();
      const testImageData = {
        id: 'test-image',
        name: 'imagen-prueba.png',
        url: testImageUrl,
        file: null as any
      };

      // Importar el servicio de ChatGPT
      const { ChatGPTService } = await import('../services/chatgptService');
      const chatGPTService = new ChatGPTService(settings);
      
      const result = await chatGPTService.testImageAnalysis(testImageData);
      
      if (result.success) {
        setImageTestResult(`✅ Prueba exitosa: ${result.details?.content || 'Análisis completado'}`);
      } else {
        setImageTestResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setImageTestResult(`❌ Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsTestingImage(false);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'success':
        return 'Conexión exitosa';
      case 'error':
        return 'Error de conexión';
      default:
        return '';
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Configuración de ChatGPT
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Habilitar ChatGPT */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Habilitar ChatGPT
                </h2>
                <p className="text-sm text-gray-600">
                  Activa la generación automática de descripciones de imágenes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleEnabledChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {settings.enabled && (
            <>
              {/* API Key */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Key className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Clave API de OpenAI
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clave API
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.apiKey}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tu clave API se almacena localmente y no se envía a nuestros servidores
                    </p>
                  </div>

                  {/* Test Connection */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={testConnection}
                      disabled={!settings.apiKey.trim() || isTestingConnection}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      {isTestingConnection ? 'Probando...' : 'Probar Conexión'}
                    </button>
                    
                    <button
                      onClick={testImageAnalysis}
                      disabled={!settings.apiKey.trim() || isTestingImage}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      {isTestingImage ? 'Probando Imagen...' : 'Probar Análisis de Imagen'}
                    </button>
                    
                    {connectionStatus !== 'idle' && (
                      <div className="flex items-center space-x-2">
                        {getConnectionStatusIcon()}
                        <span className={`text-sm font-medium ${
                          connectionStatus === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {getConnectionStatusText()}
                        </span>
                      </div>
                    )}
                    
                    {imageTestResult && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{imageTestResult}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Model Selection */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Modelo de ChatGPT
                  </h2>
                </div>
                
                <div className="space-y-3">
                  {modelOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="model"
                        value={option.value}
                        checked={settings.model === option.value}
                        onChange={() => handleModelChange(option.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {option.price}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  ¿Cómo funciona?
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Las imágenes se analizan automáticamente con IA</li>
                  <li>• Se genera descripción, leyenda y texto alternativo</li>
                  <li>• Los resultados se exportan en un archivo de texto</li>
                  <li>• Se cobra por uso según el modelo seleccionado</li>
                </ul>
              </div>
            </>
          )}

          {/* Botón de Limpiar Configuración */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Limpiar Configuración
                </h3>
                <p className="text-sm text-gray-600">
                  Restablece tu configuración de ChatGPT a los valores predeterminados
                </p>
              </div>
              <button
                onClick={handleClearSettings}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpiar Configuración</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
