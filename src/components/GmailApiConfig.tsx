import React, { useState } from 'react';
import { ArrowLeft, Mail, Key, Eye, EyeOff, CheckCircle, XCircle, Send, ExternalLink, RefreshCw } from 'lucide-react';
import { GmailApiSettings } from '../types';
import { Popup } from './Popup';
import { usePopup } from '../hooks/usePopup';
import { gmailApiService } from '../services/gmailApiService';

interface GmailApiConfigProps {
  settings: GmailApiSettings;
  onSettingsChange: (settings: GmailApiSettings) => void;
  onBack: () => void;
}

export const GmailApiConfig: React.FC<GmailApiConfigProps> = ({
  settings,
  onSettingsChange,
  onBack
}) => {
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestStatus, setEmailTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const { popupState, hidePopup, showConfirm } = usePopup();

  const handleInputChange = (field: keyof GmailApiSettings, value: string | boolean) => {
    onSettingsChange({
      ...settings,
      [field]: value
    });
    setConnectionStatus('idle');
    setEmailTestStatus('idle');
  };

  const handleTestConnection = async () => {
    // Validar configuración básica
    if (!settings.clientId || !settings.clientSecret) {
      setConnectionStatus('error');
      showConfirm(
        'Configuración incompleta',
        'Por favor configura el Client ID y Client Secret de Gmail API antes de probar la conexión.',
        () => {},
        {
          confirmText: 'Entendido',
          cancelText: '',
          type: 'error',
          showButtons: false
        }
      );
      return;
    }

    // Validar configuración del remitente
    if (!settings.fromEmail || !settings.fromName) {
      setConnectionStatus('error');
      showConfirm(
        'Configuración del remitente incompleta',
        'Por favor configura el Email del remitente y Nombre del remitente antes de probar la conexión.',
        () => {},
        {
          confirmText: 'Entendido',
          cancelText: '',
          type: 'error',
          showButtons: false
        }
      );
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Configurar el servicio de Gmail API
      gmailApiService.setGmailConfig(settings);
      
      // Probar la conexión
      const result = await gmailApiService.testConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        showConfirm(
          'Conexión exitosa',
          'La conexión con Gmail API se estableció correctamente. Ya puedes enviar emails.',
          () => {},
          {
            confirmText: 'Entendido',
            cancelText: '',
            type: 'success',
            showButtons: false
          }
        );
      } else {
        setConnectionStatus('error');
        showConfirm(
          'Error de conexión',
          `No se pudo conectar con Gmail API: ${result.error}`,
          () => {},
          {
            confirmText: 'Entendido',
            cancelText: '',
            type: 'error',
            showButtons: false
          }
        );
      }
    } catch (error) {
      setConnectionStatus('error');
      showConfirm(
        'Error inesperado',
        `Ocurrió un error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        () => {},
        {
          confirmText: 'Entendido',
          cancelText: '',
          type: 'error',
          showButtons: false
        }
      );
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleAuthorize = async () => {
    // Validar configuración básica
    if (!settings.clientId || !settings.clientSecret) {
      showConfirm(
        'Configuración incompleta',
        'Por favor configura el Client ID y Client Secret de Gmail API antes de autorizar.',
        () => {},
        {
          confirmText: 'Entendido',
          cancelText: '',
          type: 'error',
          showButtons: false
        }
      );
      return;
    }

    // Validar configuración del remitente
    if (!settings.fromEmail || !settings.fromName) {
      showConfirm(
        'Configuración del remitente incompleta',
        'Por favor configura el Email del remitente y Nombre del remitente antes de autorizar.',
        () => {},
        {
          confirmText: 'Entendido',
          cancelText: '',
          type: 'error',
          showButtons: false
        }
      );
      return;
    }

    setIsAuthorizing(true);
    
    try {
      gmailApiService.setGmailConfig(settings);
      const authUrl = gmailApiService.getAuthUrl();
      
      // Abrir ventana de autorización
      const authWindow = window.open(authUrl, 'gmail-auth', 'width=500,height=600');
      
      // Escuchar el mensaje de la ventana de autorización
      const messageListener = (event: MessageEvent) => {
        console.log('📨 Mensaje recibido:', event.data);
        console.log('🌐 Origen:', event.origin);
        console.log('🎯 Origen esperado:', window.location.origin);
        
        if (event.origin !== window.location.origin) {
          console.log('⚠️ Origen no coincide, ignorando mensaje');
          return;
        }
        
        if (event.data.type === 'GMAIL_AUTH_SUCCESS') {
          console.log('✅ Autorización exitosa recibida');
          const { accessToken, refreshToken } = event.data;
          
          // Actualizar configuración
          const updatedSettings = {
            ...settings,
            accessToken,
            refreshToken
          };
          
          onSettingsChange(updatedSettings);
          
          // Guardar en localStorage como respaldo
          try {
            const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
            if (!userSettings.gmailApiSettings) {
              userSettings.gmailApiSettings = {};
            }
            userSettings.gmailApiSettings.accessToken = accessToken;
            userSettings.gmailApiSettings.refreshToken = refreshToken;
            localStorage.setItem('userSettings', JSON.stringify(userSettings));
            console.log('💾 Tokens guardados en localStorage desde ventana principal');
          } catch (error) {
            console.error('❌ Error al guardar tokens en localStorage:', error);
          }
          
          // Cerrar ventana popup si está abierta
          if (authWindow && !authWindow.closed) {
            console.log('🚪 [GmailApiConfig] Cerrando ventana popup...');
            authWindow.close();
          }
          
          // Limpiar listener y estado
          window.removeEventListener('message', messageListener);
          setIsAuthorizing(false);
          
          // Mostrar notificación de éxito
          showConfirm(
            'Autorización exitosa',
            'La aplicación ha sido autorizada correctamente. Ahora puedes enviar emails.',
            () => {},
            {
              confirmText: 'Entendido',
              cancelText: '',
              type: 'success',
              showButtons: false
            }
          );
          
          // Forzar actualización de la configuración
          console.log('🔄 [GmailApiConfig] Actualizando configuración...');
          setTimeout(() => {
            // Recargar la configuración para verificar el estado
            onSettingsChange(updatedSettings);
          }, 500);
        } else if (event.data.type === 'GMAIL_AUTH_ERROR') {
          console.log('❌ Error de autorización recibido:', event.data.error);
          
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
          window.removeEventListener('message', messageListener);
          setIsAuthorizing(false);
          
          showConfirm(
            'Error de autorización',
            `Error al autorizar: ${event.data.error}`,
            () => {},
            {
              confirmText: 'Entendido',
              cancelText: '',
              type: 'error',
              showButtons: false
            }
          );
        }
      };
      
      window.addEventListener('message', messageListener);
      
      // Verificar si la ventana se cerró manualmente
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          console.log('🚪 [GmailApiConfig] Ventana cerrada manualmente');
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          setIsAuthorizing(false);
          
          // Mostrar mensaje de que la autorización fue cancelada
          showConfirm(
            'Autorización cancelada',
            'La ventana de autorización fue cerrada. Si quieres autorizar la aplicación, intenta nuevamente.',
            () => {},
            {
              confirmText: 'Entendido',
              cancelText: '',
              type: 'warning',
              showButtons: false
            }
          );
        }
      }, 1000);
      
      // Timeout para cerrar la ventana si no hay respuesta
      setTimeout(() => {
        if (authWindow && !authWindow.closed) {
          authWindow.close();
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          setIsAuthorizing(false);
        }
      }, 300000); // 5 minutos
      
    } catch (error) {
      setIsAuthorizing(false);
      showConfirm(
        'Error de autorización',
        `Error al iniciar autorización: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        () => {},
        {
          confirmText: 'Entendido',
          cancelText: '',
          type: 'error',
          showButtons: false
        }
      );
    }
  };

  const handleTestEmail = async () => {
    // Validar email de prueba
    if (!testEmailAddress || !gmailApiService.isValidEmail(testEmailAddress)) {
      setEmailTestStatus('error');
      showConfirm(
        'Error en el email de prueba',
        'Por favor ingresa una dirección de email válida para enviar el email de prueba.',
        () => {},
        {
          confirmText: 'Entendido',
          cancelText: '',
          type: 'error',
          showButtons: false
        }
      );
      return;
    }

    // Validar autorización
    if (!settings.accessToken) {
      setEmailTestStatus('error');
      showConfirm(
        'No autorizado',
        'Necesitas autorizar la aplicación con Gmail antes de enviar emails. Haz clic en "Autorizar con Gmail".',
        () => {},
        {
          confirmText: 'Entendido',
          cancelText: '',
          type: 'error',
          showButtons: false
        }
      );
      return;
    }

    // Validar configuración del remitente
    if (!settings.fromEmail || !settings.fromName) {
      setEmailTestStatus('error');
      showConfirm(
        'Configuración del remitente incompleta',
        'Por favor configura el Email del remitente y Nombre del remitente antes de enviar emails.',
        () => {},
        {
          confirmText: 'Entendido',
          cancelText: '',
          type: 'error',
          showButtons: false
        }
      );
      return;
    }

    setIsTestingEmail(true);
    setEmailTestStatus('idle');

    try {
      // Configurar el servicio de Gmail API
      gmailApiService.setGmailConfig(settings);
      
      // Generar una contraseña temporal para el email de prueba
      const tempPassword = gmailApiService.generateTemporaryPassword(8);
      
      // Enviar email de prueba
      const result = await gmailApiService.sendPasswordRecoveryEmail({
        to: testEmailAddress,
        username: 'Usuario de Prueba',
        newPassword: tempPassword,
        resetLink: 'https://ejemplo.com/reset-password'
      });

      if (result.success) {
        setEmailTestStatus('success');
        showConfirm(
          'Email de prueba enviado',
          `El email de prueba se ha enviado exitosamente a ${testEmailAddress} usando Gmail API. Revisa tu bandeja de entrada.`,
          () => {},
          {
            confirmText: 'Entendido',
            cancelText: '',
            type: 'success',
            showButtons: false
          }
        );
      } else {
        setEmailTestStatus('error');
        showConfirm(
          'Error al enviar email',
          `No se pudo enviar el email de prueba: ${result.error}`,
          () => {},
          {
            confirmText: 'Entendido',
            cancelText: '',
            type: 'error',
            showButtons: false
          }
        );
      }
    } catch (error) {
      setEmailTestStatus('error');
      showConfirm(
        'Error inesperado',
        `Ocurrió un error inesperado al enviar el email de prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        () => {},
        {
          confirmText: 'Entendido',
          cancelText: '',
          type: 'error',
          showButtons: false
        }
      );
    } finally {
      setIsTestingEmail(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-400" />;
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

  const getEmailStatusIcon = () => {
    switch (emailTestStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-400" />;
    }
  };

  const getEmailStatusText = () => {
    switch (emailTestStatus) {
      case 'success':
        return 'Email enviado exitosamente';
      case 'error':
        return 'Error al enviar email';
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
            <div className="p-3 bg-red-100 rounded-lg">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuración Gmail API</h1>
              <p className="text-gray-600 mt-1">
                Configura la Gmail API para envío de emails moderno y seguro
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
              
              <div className="space-y-4">
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !settings.clientId || !settings.clientSecret}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {isTestingConnection ? 'Probando conexión...' : 'Probar conexión'}
                  </span>
                </button>

                {!settings.accessToken && (
                  <button
                    onClick={handleAuthorize}
                    disabled={isAuthorizing || !settings.clientId || !settings.clientSecret}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {isAuthorizing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    <span>
                      {isAuthorizing ? 'Autorizando...' : 'Autorizar con Gmail'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Prueba de envío de email */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Prueba de Envío de Email</h2>
                <div className="flex items-center space-x-2">
                  {getEmailStatusIcon()}
                  <span className={`text-sm font-medium ${
                    emailTestStatus === 'success' ? 'text-green-600' :
                    emailTestStatus === 'error' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {getEmailStatusText()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de destino para la prueba
                  </label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="tu-email@ejemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se enviará un email de recuperación de contraseña de prueba usando Gmail API
                  </p>
                </div>
                
                <button
                  onClick={handleTestEmail}
                  disabled={isTestingEmail || !testEmailAddress || !settings.accessToken}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isTestingEmail ? 'Enviando email de prueba...' : 'Enviar email de prueba'}
                  </span>
                </button>
              </div>
            </div>

            {/* Configuración de la API */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Configuración de Gmail API</h2>
                <div className="flex items-center space-x-2">
                  {settings.accessToken ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Autorizado</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">No autorizado</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={settings.clientId}
                    onChange={(e) => handleInputChange('clientId', e.target.value)}
                    placeholder="123456789-abcdefg.apps.googleusercontent.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Obtén este valor desde Google Cloud Console
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showClientSecret ? 'text' : 'password'}
                      value={settings.clientSecret}
                      onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                      placeholder="GOCSPX-abcdefghijklmnop"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientSecret(!showClientSecret)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showClientSecret ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Obtén este valor desde Google Cloud Console
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redirect URI
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settings.redirectUri}
                      readOnly
                      placeholder="http://localhost:3000/auth/callback"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed pr-20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(settings.redirectUri);
                        showConfirm(
                          'URL Copiada',
                          'La URL de redirección ha sido copiada al portapapeles.',
                          () => {},
                          {
                            confirmText: 'Entendido',
                            cancelText: '',
                            type: 'success',
                            showButtons: false
                          }
                        );
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      title="Copiar URL"
                    >
                      📋 Copiar
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    URL fija de EasyPanel donde Google redirigirá después de la autorización. No se puede modificar.
                  </p>
                </div>
              </div>
            </div>

            {/* Configuración del remitente */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Configuración del Remitente</h2>
                <div className="flex items-center space-x-2">
                  {settings.fromEmail && settings.fromName ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Configurado</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Incompleto</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email del remitente
                  </label>
                  <input
                    type="email"
                    value={settings.fromEmail}
                    onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                    placeholder="admin@koko.toys"
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
                    placeholder="Koko.toys Admin"
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
                  <span className="text-sm text-gray-600">Gmail API Habilitada</span>
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
                  <span className="text-sm text-gray-600">Autorizado</span>
                  <span className={`text-sm font-medium ${
                    settings.accessToken ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {settings.accessToken ? 'Sí' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API configurada</span>
                  <span className={`text-sm font-medium ${
                    settings.clientId && settings.clientSecret ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {settings.clientId && settings.clientSecret ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Información de ayuda */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">Información de Ayuda</h3>
              
              <div className="space-y-4 text-sm text-blue-800">
                <div>
                  <strong>Gmail API:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Más moderna que SMTP</li>
                    <li>• Mayor seguridad y confiabilidad</li>
                    <li>• Mejor deliverability</li>
                    <li>• Sin límites de envío estrictos</li>
                  </ul>
                </div>
                
                <div className="pt-3 border-t border-blue-200">
                  <strong>💡 Pasos para configurar:</strong>
                  <ol className="ml-4 mt-1 space-y-1 list-decimal">
                    <li>Crear proyecto en Google Cloud Console</li>
                    <li>Habilitar Gmail API</li>
                    <li>Crear credenciales OAuth2</li>
                    <li>Configurar Client ID y Secret</li>
                    <li>Autorizar la aplicación</li>
                  </ol>
                </div>
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
