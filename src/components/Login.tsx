import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, User, Lock, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import { databaseService } from '../services/databaseService';
import { emailService } from '../services/emailService';
import { Popup } from './Popup';
import { usePopup } from '../hooks/usePopup';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDefaultCredentials, setShowDefaultCredentials] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const { popupState, hidePopup, showAlert, showConfirm } = usePopup();

  useEffect(() => {
    // Verificar si es la primera vez o si la contraseña del root sigue siendo la predeterminada
    const checkDefaultCredentials = () => {
      try {
        const users = authService.getAllUsers();
        const rootUser = users.find(user => user.username === 'root');
        
        // Mostrar credenciales predeterminadas solo si:
        // 1. Es la primera vez (no hay usuarios)
        // 2. El usuario root existe y tiene la contraseña predeterminada
        if (users.length === 0 || (rootUser && rootUser.password === '12345')) {
          setShowDefaultCredentials(true);
        } else {
          setShowDefaultCredentials(false);
        }
      } catch (error) {
        console.error('Error checking default credentials:', error);
        // En caso de error, mostrar las credenciales por seguridad
        setShowDefaultCredentials(true);
      }
    };

    checkDefaultCredentials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login(username.trim(), password);
      
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Error de autenticación');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Error interno del sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = async () => {
    if (!recoveryEmail.trim()) {
      showAlert('Error', 'Por favor ingresa tu dirección de email');
      return;
    }

    if (!emailService.isValidEmail(recoveryEmail)) {
      showAlert('Error', 'Por favor ingresa una dirección de email válida');
      return;
    }

    setIsRecovering(true);

    try {
      // Buscar usuario por email
      const users = authService.getAllUsers();
      const user = users.find(u => u.email === recoveryEmail || u.username === recoveryEmail);
      
      if (!user) {
        showAlert('Error', 'No se encontró un usuario con esa dirección de email. Asegúrate de haber configurado tu email en el perfil.');
        return;
      }

      // Generar nueva contraseña temporal
      const newPassword = emailService.generateTemporaryPassword(12);
      
      // Actualizar contraseña del usuario
      const updateResult = await authService.updateUserPassword(user.id, newPassword);
      
      if (!updateResult.success) {
        showAlert('Error', 'No se pudo actualizar la contraseña');
        return;
      }

      // Configurar SMTP con la configuración del root
      const rootSMTPSettings = await databaseService.getUserSMTPSettings('root');
      emailService.setSMTPSettings(rootSMTPSettings);

      // Enviar email de recuperación
      const emailResult = await emailService.sendPasswordRecoveryEmail({
        to: recoveryEmail,
        username: user.username,
        newPassword: newPassword
      });

      if (emailResult.success) {
        showAlert(
          'Contraseña enviada',
          'Se ha enviado una nueva contraseña temporal a tu dirección de email. Por favor revisa tu bandeja de entrada y spam.'
        );
        setShowPasswordRecovery(false);
        setRecoveryEmail('');
      } else {
        showAlert('Error', `No se pudo enviar el email: ${emailResult.error}`);
      }
    } catch (error) {
      console.error('Password recovery error:', error);
      showAlert('Error', 'Error interno del sistema');
    } finally {
      setIsRecovering(false);
    }
  };

  if (showPasswordRecovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Recuperar Contraseña
            </h1>
            <p className="text-gray-600">
              Ingresa tu email para recibir una nueva contraseña
            </p>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Asegúrate de haber configurado tu email en la configuración de perfil. 
                Si no lo has hecho, contacta al administrador.
              </p>
            </div>
          </div>

          {/* Recovery Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={(e) => { e.preventDefault(); handlePasswordRecovery(); }} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="recoveryEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección de Email
                </label>
                <div className="relative">
                  <input
                    id="recoveryEmail"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isRecovering}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isRecovering ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Enviar Nueva Contraseña</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowPasswordRecovery(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Volver al Login</span>
                </button>
              </div>
            </form>
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Convertidor de Imágenes
          </h1>
          <p className="text-gray-600">
            Inicia sesión para acceder a la aplicación
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Ingresa tu usuario"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Ingresa tu contraseña"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowPasswordRecovery(true)}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>

          {/* Default Credentials Info - Solo se muestra la primera vez o si la contraseña no ha sido cambiada */}
          {showDefaultCredentials && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Credenciales predeterminadas:
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Usuario:</strong> root</p>
                <p><strong>Contraseña:</strong> 12345</p>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                ⚠️ Se recomienda cambiar la contraseña después del primer acceso
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Sistema de conversión de imágenes con IA
          </p>
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
