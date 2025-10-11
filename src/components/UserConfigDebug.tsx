import React from 'react';
import { UserChatGPTSettings, UserPromptSettings, UserConversionSettings } from '../types';

interface UserConfigDebugProps {
  username: string;
  chatGPTSettings: UserChatGPTSettings;
  promptSettings: UserPromptSettings;
  conversionSettings: UserConversionSettings;
}

export const UserConfigDebug: React.FC<UserConfigDebugProps> = ({
  username,
  chatGPTSettings,
  promptSettings,
  conversionSettings
}) => {
  const testIsolation = () => {
    console.log('🧪 Test de Aislamiento para usuario:', username);
    console.log('📋 Configuración actual en estado:', {
      chatGPT: chatGPTSettings,
      prompts: promptSettings,
      conversion: conversionSettings
    });
    
    // Verificar localStorage
    const dbData = localStorage.getItem('image-converter-db');
    if (dbData) {
      const parsed = JSON.parse(dbData);
      console.log('📊 Base de datos completa:', parsed);
      
      if (parsed.userSettings) {
        console.log('👥 Todos los usuarios en la base de datos:');
        Object.keys(parsed.userSettings).forEach(user => {
          const userConfig = parsed.userSettings[user];
          console.log(`  - ${user}:`, {
            hasApiKey: !!userConfig.chatGPTSettings?.apiKey,
            apiKey: userConfig.chatGPTSettings?.apiKey ? userConfig.chatGPTSettings.apiKey.substring(0, 10) + '...' : 'Vacía',
            model: userConfig.chatGPTSettings?.model,
            enabled: userConfig.chatGPTSettings?.enabled
          });
        });
      }
    }
    
    // Verificar usuario actual
    const currentUser = localStorage.getItem('current-user');
    console.log('👤 Usuario actual en localStorage:', currentUser);
    
    // Verificar si hay usuarios registrados
    const users = localStorage.getItem('app-users');
    console.log('👥 Usuarios registrados:', users);
  };

  const testSaveConfig = () => {
    const testApiKey = `sk-test-${username}-${Date.now()}`;
    console.log('💾 Simulando guardado de configuración para usuario:', username);
    console.log('🔑 API Key de prueba:', testApiKey);
    
    // Simular guardado en localStorage
    const dbData = localStorage.getItem('image-converter-db');
    if (dbData) {
      const parsed = JSON.parse(dbData);
      if (!parsed.userSettings) {
        parsed.userSettings = {};
      }
      if (!parsed.userSettings[username]) {
        parsed.userSettings[username] = {
          username,
          chatGPTSettings: { apiKey: '', model: 'gpt-4o', enabled: false },
          promptSettings: {},
          conversionSettings: {}
        };
      }
      
      parsed.userSettings[username].chatGPTSettings.apiKey = testApiKey;
      parsed.userSettings[username].chatGPTSettings.enabled = true;
      parsed.userSettings[username].chatGPTSettings.model = 'gpt-4o-mini';
      
      localStorage.setItem('image-converter-db', JSON.stringify(parsed));
      console.log('✅ Configuración de prueba guardada para:', username);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-yellow-800">
          🐛 Debug - Configuración de Usuario: {username}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={testIsolation}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded font-medium"
          >
            🧪 Test Aislamiento
          </button>
          <button
            onClick={testSaveConfig}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium"
          >
            💾 Test Guardado
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ChatGPT Settings */}
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-gray-800 mb-2">ChatGPT</h4>
          <div className="text-sm space-y-1">
            <div><strong>API Key:</strong> {chatGPTSettings.apiKey ? `${chatGPTSettings.apiKey.substring(0, 10)}...` : 'Vacía'}</div>
            <div><strong>Modelo:</strong> {chatGPTSettings.model}</div>
            <div><strong>Habilitado:</strong> {chatGPTSettings.enabled ? 'Sí' : 'No'}</div>
          </div>
        </div>

        {/* Prompt Settings */}
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-gray-800 mb-2">Prompts</h4>
          <div className="text-sm space-y-1">
            <div><strong>Personalizados:</strong> {promptSettings.useCustomPrompts ? 'Sí' : 'No'}</div>
            <div><strong>Título:</strong> {promptSettings.titlePrompt.substring(0, 30)}...</div>
            <div><strong>Descripción:</strong> {promptSettings.descriptionPrompt.substring(0, 30)}...</div>
          </div>
        </div>

        {/* Conversion Settings */}
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-gray-800 mb-2">Conversión</h4>
          <div className="text-sm space-y-1">
            <div><strong>Formato:</strong> {conversionSettings.format}</div>
            <div><strong>Calidad:</strong> {conversionSettings.quality}%</div>
            <div><strong>Prefijo:</strong> {conversionSettings.imageNamePrefix}</div>
            <div><strong>SDK:</strong> {conversionSettings.sdkSuffix}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
