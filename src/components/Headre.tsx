import React from 'react';
import { Image, Settings, Brain, FileText, Trash2, BarChart3 } from 'lucide-react';

interface HeaderProps {
  onChatGPTConfig?: () => void;
  onPromptConfig?: () => void;
  onClearConfig?: () => void;
  onUsageHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onChatGPTConfig, onPromptConfig, onClearConfig, onUsageHistory }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-0 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Image className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Convertidor de Imágenes</h1>
          <p className="text-sm text-gray-500">Convierte imágenes a múltiples formatos</p>
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
        <button 
          onClick={onUsageHistory}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Historial de Uso"
        >
          <BarChart3 className="w-5 h-5" />
        </button>
        <button 
          onClick={onClearConfig}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Limpiar configuración"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};