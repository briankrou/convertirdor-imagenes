import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, UserPlus, Trash2, Key, Eye, EyeOff, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';
import { databaseService } from '../services/databaseService';
import { emailService } from '../services/emailService';
import { Popup } from './Popup';
import { usePopup } from '../hooks/usePopup';

interface UserManagementProps {
  onBack: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentUser] = useState(authService.getCurrentUser());
  const { popupState, hidePopup, showConfirm, showAlert } = usePopup();

  // Create user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [showNewPassword, setShowNewPassword] = useState(false);


  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const allUsers = authService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ type: 'error', text: 'Error al cargar usuarios' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername.trim() || !newPassword.trim()) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
      return;
    }

    try {
      const result = await authService.createUser(newUsername.trim(), newPassword, newUserRole === 'admin');
      
      if (result.success) {
        setMessage({ type: 'success', text: `Usuario ${newUserRole === 'admin' ? 'administrador' : 'normal'} creado exitosamente` });
        setNewUsername('');
        setNewPassword('');
        setNewUserRole('user');
        setShowCreateForm(false);
        loadUsers();
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al crear usuario' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage({ type: 'error', text: 'Error interno del sistema' });
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    showConfirm(
      'Eliminar usuario',
      `¿Estás seguro de que quieres eliminar al usuario "${username}"?`,
      async () => {
        try {
          const result = await authService.deleteUser(userId);
          
          if (result.success) {
            setMessage({ type: 'success', text: 'Usuario eliminado exitosamente' });
            loadUsers();
          } else {
            setMessage({ type: 'error', text: result.error || 'Error al eliminar usuario' });
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          setMessage({ type: 'error', text: 'Error interno del sistema' });
        }
      },
      {
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'error'
      }
    );
  };

  const handleResetPassword = async (userId: string, username: string) => {
    showConfirm(
      'Restablecer contraseña',
      `¿Estás seguro de que quieres restablecer la contraseña del usuario "${username}"? Se generará una nueva contraseña temporal.`,
      async () => {
        try {
          // Obtener información del usuario
          const users = authService.getAllUsers();
          const user = users.find(u => u.id === userId);
          
          if (!user) {
            setMessage({ type: 'error', text: 'Usuario no encontrado' });
            return;
          }

          // Generar nueva contraseña temporal
          const newPassword = generateTemporaryPassword(12);
          
          // Actualizar contraseña del usuario
          const updateResult = await authService.updateUserPassword(userId, newPassword);
          
          if (updateResult.success) {
            let messageText = `Contraseña restablecida exitosamente. Nueva contraseña: ${newPassword}`;
            
            // Intentar enviar email si el usuario tiene email configurado
            if (user.email) {
              try {
                // Configurar SMTP con la configuración del root
                const rootSMTPSettings = await databaseService.getUserSMTPSettings('root');
                emailService.setSMTPSettings(rootSMTPSettings);

                // Enviar email de recuperación
                const emailResult = await emailService.sendPasswordRecoveryEmail({
                  to: user.email,
                  username: user.username,
                  newPassword: newPassword
                });

                if (emailResult.success) {
                  messageText += ` Se ha enviado un email con la nueva contraseña a ${user.email}.`;
                } else {
                  messageText += ` No se pudo enviar el email: ${emailResult.error}`;
                }
              } catch (emailError) {
                console.error('Error sending email:', emailError);
                messageText += ` No se pudo enviar el email.`;
              }
            } else {
              messageText += ` Nota: El usuario no tiene email configurado, por lo que no se envió notificación por correo.`;
            }
            
            setMessage({ 
              type: 'success', 
              text: messageText
            });
            loadUsers();
          } else {
            setMessage({ type: 'error', text: updateResult.error || 'Error al restablecer contraseña' });
          }
        } catch (error) {
          console.error('Error resetting password:', error);
          setMessage({ type: 'error', text: 'Error interno del sistema' });
        }
      },
      {
        confirmText: 'Restablecer',
        cancelText: 'Cancelar',
        type: 'warning'
      }
    );
  };

  // Función para generar contraseña temporal
  const generateTemporaryPassword = (length: number = 12): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  };


  const clearMessage = () => {
    setMessage(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Gestión de Usuarios
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentUser?.isRoot && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nuevo Usuario</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
            <button
              onClick={clearMessage}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Create User Form */}
        {showCreateForm && currentUser?.isRoot && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Usuario</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label htmlFor="new-username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Usuario
                </label>
                <input
                  id="new-username"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Ingresa el nombre de usuario"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Ingresa la contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="new-user-role" className="block text-sm font-medium text-gray-700 mb-1">
                  Perfil de Usuario
                </label>
                <select
                  id="new-user-role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="user">Usuario Normal</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {newUserRole === 'admin' 
                    ? 'Los administradores pueden gestionar usuarios y ver estadísticas completas'
                    : 'Los usuarios normales solo pueden ver su propio consumo'
                  }
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Crear Usuario
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}


        {/* Users List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Lista de Usuarios ({users.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            user.isRoot 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Tú
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isRoot 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isRoot ? (user.username === 'root' ? 'Root' : 'Administrador') : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email ? (
                        <span className="text-blue-600">{user.email}</span>
                      ) : (
                        <span className="text-gray-400 italic">No configurado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {currentUser?.isRoot && user.id !== currentUser.id && (
                          <button
                            onClick={() => handleResetPassword(user.id, user.username)}
                            className="text-orange-600 hover:text-orange-900 flex items-center space-x-1"
                            title="Restablecer contraseña"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Restablecer</span>
                          </button>
                        )}
                        {currentUser?.isRoot && !user.isRoot && user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
