import React, { useState, useRef } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { Camera, User as UserIcon, Lock, Save, Upload } from 'lucide-react';

interface ProfileConfigProps {
  currentUser: User;
  onBack: () => void;
  onProfileUpdated: (user: User) => void;
}

export const ProfileConfig: React.FC<ProfileConfigProps> = ({
  currentUser,
  onBack,
  onProfileUpdated
}) => {
  const [profileName, setProfileName] = useState(currentUser.profileName || currentUser.username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(currentUser.profileImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('La imagen debe ser menor a 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar nombre de perfil
      if (!profileName.trim()) {
        setError('El nombre del perfil es requerido');
        return;
      }

      // Actualizar perfil
      const updatedUser = await authService.updateUserProfile(currentUser.id, {
        profileName: profileName.trim(),
        profileImage: profileImage
      });

      onProfileUpdated(updatedUser);
      setSuccess('Perfil actualizado correctamente');
    } catch (error) {
      setError('Error al actualizar el perfil');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar contraseñas
      if (!currentPassword) {
        setError('La contraseña actual es requerida');
        return;
      }

      if (!newPassword) {
        setError('La nueva contraseña es requerida');
        return;
      }

      if (newPassword.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Las contraseñas nuevas no coinciden');
        return;
      }

      // Cambiar contraseña
      const result = await authService.changePassword(currentUser.username, currentPassword, newPassword);
      
      if (result.success) {
        setSuccess('Contraseña cambiada correctamente');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.error || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      setError('Error al cambiar la contraseña');
      console.error('Error changing password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Configuración de Perfil</h1>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Image Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Foto de Perfil
            </h2>
            
            <div className="flex items-center space-x-6">
              {/* Profile Image Display */}
              <div className="relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <div className="space-y-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir Foto</span>
                  </button>
                  
                  {profileImage && (
                    <button
                      onClick={handleRemoveImage}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <span>Eliminar Foto</span>
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Profile Name Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Información del Perfil
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  value={currentUser.username}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">El nombre de usuario no se puede cambiar</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Perfil
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Este nombre se mostrará en la aplicación</p>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Cambiar Contraseña
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Perfil</span>
            </button>
            
            <button
              onClick={handleChangePassword}
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Cambiar Contraseña</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
