import React from 'react';
import { Brain, FileText, Trash2, BarChart3, Users, LogOut, User, Globe, Building2 } from 'lucide-react';

interface HeaderProps {
  onChatGPTConfig?: () => void;
  onPromptConfig?: () => void;
  onCurrencyAPIConfig?: () => void;
  onClearConfig?: () => void;
  onUsageHistory?: () => void;
  onUserManagement?: () => void;
  onBrandsPanel?: () => void;
  onProfileConfig?: () => void;
  onLogout?: () => void;
  currentUser?: { username: string; isRoot: boolean; profileName?: string; profileImage?: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  onChatGPTConfig,
  onPromptConfig,
  onCurrencyAPIConfig,
  onClearConfig,
  onUsageHistory,
  onUserManagement,
  onBrandsPanel,
  onProfileConfig,
  onLogout,
  currentUser
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-0 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        {/* Profile Image in Blue Box */}
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
          {currentUser?.profileImage ? (
            <img
              src={currentUser.profileImage}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Convertidor de Imágenes</h1>
          <p className="text-sm text-gray-500">
            {currentUser ? (currentUser.profileName || currentUser.username) : 'Convierte imágenes a múltiples formatos'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button 
          onClick={onPromptConfig}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Configurar Prompts"
        >
          <FileText className="w-5 h-5" />
        </button>
        <button 
          onClick={onChatGPTConfig}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Configurar ChatGPT"
        >
          <Brain className="w-5 h-5" />
        </button>
        {currentUser?.isRoot && (
          <button 
            onClick={onCurrencyAPIConfig}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Configurar Conversión de Monedas"
          >
            <Globe className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onBrandsPanel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Gestión de Marcas"
        >
          <Building2 className="w-5 h-5" />
        </button>
        <button
          onClick={onUsageHistory}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Historial de Uso"
        >
          <BarChart3 className="w-5 h-5" />
        </button>
        {currentUser?.isRoot && (
          <button 
            onClick={onUserManagement}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Gestión de Usuarios"
          >
            <Users className="w-5 h-5" />
          </button>
        )}
        <button 
          onClick={onProfileConfig}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Configurar Perfil"
        >
          <User className="w-5 h-5" />
        </button>
        <button 
          onClick={onClearConfig}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Limpiar configuración"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button 
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};