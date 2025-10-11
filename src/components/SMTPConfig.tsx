import React, { useState } from 'react';
import { ArrowLeft, Mail, Server, Key, Eye, EyeOff, Trash2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { UserSMTPSettings } from '../types';
import { Popup } from './Popup';
import { usePopup } from '../hooks/usePopup';

interface SMTPConfigProps {
  settings: UserSMTPSettings;
  onSettingsChange: (settings: UserSMTPSettings) => void;
  onClearSettings: () => void;
  onBack: () => void;
}

export const SMTPConfig: React.FC<SMTPConfigProps> = ({
  settings,
  onSettingsChange,
  onClearSettings,
  onBack
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { popupState, hidePopup, showConfirm } = usePopup();

  const handleInputChange = (field: keyof UserSMTPSettings, value: string | number | boolean) => {
    onSettingsChange({
      ...settings,
      [field]: value
    });
    setConnectionStatus('idle');
  };

  const handleClearSettings = () => {
    showConfirm(
      'Limpiar configuración SMTP',
      '¿Estás seguro de que quieres limpiar tu configuración SMTP? Esta acción restablecerá todos los valores a los predeterminados.',
      () => {
        onClearSettings();
      },
      {
        confirmText: 'Limpiar',
        cancelText: 'Cancelar',
        type: 'warning'
      }
    );
  };

  const handleTestConnection = async () => {
    if (!settings.host || !settings.port || !settings.username || !settings.password) {
      setConnectionStatus('error');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Simular prueba de conexión (en una implementación real, esto haría una llamada al backend)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular resultado exitoso
      setConnectionStatus('success');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Server className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'success':
        return 'Conexión exitosa';
      case 'error':
        return 'Error de conexión';
      default:
        return 'No probado';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al panel de administración
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuración SMTP</h1>
              <p className="text-gray-600 mt-1">
                Configura el servidor de correo para recuperación de contraseñas
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuración principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado de conexión */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Estado de Conexión</h2>
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className={`text-sm font-medium ${
                    connectionStatus === 'success' ? 'text-green-600' :
                    connectionStatus === 'error' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection || !settings.host || !settings.port || !settings.username || !settings.password}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <TestTube className="w-4 h-4" />
                <span>
                  {isTestingConnection ? 'Probando conexión...' : 'Probar conexión'}
                </span>
              </button>
            </div>

            {/* Configuración del servidor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuración del Servidor</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host del servidor SMTP
                  </label>
                  <input
                    type="text"
                    value={settings.host}
                    onChange={(e) => handleInputChange('host', e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puerto
                  </label>
                  <input
                    type="number"
                    value={settings.port}
                    onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 587)}
                    placeholder="587"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={settings.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="tu-email@gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={settings.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Tu contraseña de aplicación"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.secure}
                    onChange={(e) => handleInputChange('secure', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Usar conexión segura (TLS/SSL)
                  </span>
                </label>
              </div>
            </div>

            {/* Configuración del remitente */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuración del Remitente</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email del remitente
                  </label>
                  <input
                    type="email"
                    value={settings.fromEmail}
                    onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                    placeholder="noreply@tuempresa.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del remitente
                  </label>
                  <input
                    type="text"
                    value={settings.fromName}
                    onChange={(e) => handleInputChange('fromName', e.target.value)}
                    placeholder="Sistema de Recuperación"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Estado general */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estado General</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SMTP Habilitado</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => handleInputChange('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conexión segura</span>
                  <span className={`text-sm font-medium ${
                    settings.secure ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {settings.secure ? 'Habilitada' : 'Deshabilitada'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Servidor configurado</span>
                  <span className={`text-sm font-medium ${
                    settings.host && settings.port ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {settings.host && settings.port ? 'Configurado' : 'Sin configurar'}
                  </span>
                </div>
              </div>
            </div>

            {/* Información de ayuda */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">Información de Ayuda</h3>
              
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <strong>Gmail:</strong> smtp.gmail.com:587
                </div>
                <div>
                  <strong>Outlook:</strong> smtp-mail.outlook.com:587
                </div>
                <div>
                  <strong>Yahoo:</strong> smtp.mail.yahoo.com:587
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <strong>Nota:</strong> Para Gmail, necesitas usar una contraseña de aplicación en lugar de tu contraseña normal.
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleClearSettings}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpiar Configuración</span>
                </button>
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
