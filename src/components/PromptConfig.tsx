import React, { useState } from 'react';
import { ArrowLeft, FileText, RotateCcw, Save, Eye, EyeOff } from 'lucide-react';
import { PromptSettings } from '../types';

interface PromptConfigProps {
  settings: PromptSettings;
  onSettingsChange: (settings: PromptSettings) => void;
  onBack: () => void;
}

export const PromptConfig: React.FC<PromptConfigProps> = ({
  settings,
  onSettingsChange,
  onBack
}) => {
  const [showPreview, setShowPreview] = useState(false);

  // Prompts predeterminados
  const defaultPrompts = {
    titlePrompt: "Genera un título atractivo y descriptivo para esta imagen (máximo 60 caracteres). El título debe ser claro, conciso y que capture la esencia del producto mostrado.",
    descriptionPrompt: "Describe detalladamente lo que ves en esta imagen. Incluye características visuales, colores, materiales, estilo y cualquier detalle relevante del producto (2-3 oraciones).",
    captionPrompt: "Crea una leyenda corta y atractiva para esta imagen que resalte las características principales del producto (1 oración).",
    altTextPrompt: "Genera un texto alternativo descriptivo para accesibilidad que describa claramente el contenido de la imagen (máximo 125 caracteres)."
  };

  const handlePromptChange = (field: keyof Omit<PromptSettings, 'useCustomPrompts'>, value: string) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  const handleUseCustomChange = (useCustom: boolean) => {
    if (useCustom) {
      onSettingsChange({ ...settings, useCustomPrompts: true });
    } else {
      onSettingsChange({ 
        ...settings, 
        useCustomPrompts: false,
        ...defaultPrompts
      });
    }
  };

  const resetToDefaults = () => {
    onSettingsChange({ 
      ...settings, 
      ...defaultPrompts,
      useCustomPrompts: true
    });
  };

  const getCurrentPrompts = () => {
    return settings.useCustomPrompts ? settings : { ...settings, ...defaultPrompts };
  };

  const currentPrompts = getCurrentPrompts();

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
            <FileText className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Configuración de Prompts
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Toggle para prompts personalizados */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Usar Prompts Personalizados
                </h2>
                <p className="text-sm text-gray-600">
                  Activa esta opción para personalizar los prompts que se envían a ChatGPT
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.useCustomPrompts}
                  onChange={(e) => handleUseCustomChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Prompts personalizados */}
          {settings.useCustomPrompts && (
            <>
              {/* Título */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Prompt para Título</h3>
                  <button
                    onClick={() => handlePromptChange('titlePrompt', defaultPrompts.titlePrompt)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restaurar</span>
                  </button>
                </div>
                <textarea
                  value={currentPrompts.titlePrompt}
                  onChange={(e) => handlePromptChange('titlePrompt', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
                  placeholder="Ingresa el prompt para generar títulos..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Este prompt se usará para generar títulos atractivos para las imágenes
                </p>
              </div>

              {/* Descripción */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Prompt para Descripción</h3>
                  <button
                    onClick={() => handlePromptChange('descriptionPrompt', defaultPrompts.descriptionPrompt)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restaurar</span>
                  </button>
                </div>
                <textarea
                  value={currentPrompts.descriptionPrompt}
                  onChange={(e) => handlePromptChange('descriptionPrompt', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
                  placeholder="Ingresa el prompt para generar descripciones..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Este prompt se usará para generar descripciones detalladas de las imágenes
                </p>
              </div>

              {/* Leyenda */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Prompt para Leyenda</h3>
                  <button
                    onClick={() => handlePromptChange('captionPrompt', defaultPrompts.captionPrompt)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restaurar</span>
                  </button>
                </div>
                <textarea
                  value={currentPrompts.captionPrompt}
                  onChange={(e) => handlePromptChange('captionPrompt', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
                  placeholder="Ingresa el prompt para generar leyendas..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Este prompt se usará para generar leyendas cortas y atractivas
                </p>
              </div>

              {/* Texto Alternativo */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Prompt para Texto Alternativo</h3>
                  <button
                    onClick={() => handlePromptChange('altTextPrompt', defaultPrompts.altTextPrompt)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restaurar</span>
                  </button>
                </div>
                <textarea
                  value={currentPrompts.altTextPrompt}
                  onChange={(e) => handlePromptChange('altTextPrompt', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
                  placeholder="Ingresa el prompt para generar texto alternativo..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Este prompt se usará para generar texto alternativo para accesibilidad
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between">
                <button
                  onClick={resetToDefaults}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restaurar Todos los Predeterminados</span>
                </button>

                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa</span>
                </button>
              </div>
            </>
          )}

          {/* Vista previa */}
          {showPreview && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-purple-900 mb-4">Vista Previa de Prompts</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-purple-800 mb-2">Título:</h4>
                  <p className="text-sm text-purple-700 bg-white p-3 rounded border">{currentPrompts.titlePrompt}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-purple-800 mb-2">Descripción:</h4>
                  <p className="text-sm text-purple-700 bg-white p-3 rounded border">{currentPrompts.descriptionPrompt}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-purple-800 mb-2">Leyenda:</h4>
                  <p className="text-sm text-purple-700 bg-white p-3 rounded border">{currentPrompts.captionPrompt}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-purple-800 mb-2">Texto Alternativo:</h4>
                  <p className="text-sm text-purple-700 bg-white p-3 rounded border">{currentPrompts.altTextPrompt}</p>
                </div>
              </div>
            </div>
          )}

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              ¿Cómo funcionan los prompts?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los prompts personalizados te permiten controlar exactamente qué tipo de contenido genera ChatGPT</li>
              <li>• Puedes usar variables como [PRODUCTO] o [PREFIJO] que se reemplazarán automáticamente</li>
              <li>• Los prompts predeterminados están optimizados para generar contenido de calidad</li>
              <li>• La descripción del producto se usará como contexto adicional, no como parte del prompt</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
