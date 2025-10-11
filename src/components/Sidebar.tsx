import React from 'react';
import { Download, Trash2, FileImage, Sliders, Package, Tag, Hash, Brain, FileText } from 'lucide-react';
import { ConversionSettings } from '../types';

interface SidebarProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
  onConvert: () => void;
  onConvertOnly: () => void;
  onDownloadConverted?: () => void;
  onClearAll: () => void;
  onGenerateDescriptions?: () => void;
  onExportDescriptions?: () => void;
  isConverting: boolean;
  isGeneratingDescriptions?: boolean;
  imageCount: number;
  convertedCount?: number;
  descriptionsCount?: number;
  chatGPTEnabled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  onSettingsChange,
  onConvert,
  onConvertOnly,
  onDownloadConverted,
  onClearAll,
  onGenerateDescriptions,
  onExportDescriptions,
  isConverting,
  isGeneratingDescriptions = false,
  imageCount,
  convertedCount = 0,
  descriptionsCount = 0,
  chatGPTEnabled = false
}) => {
  const formatOptions = [
    { value: 'jpeg', label: 'JPEG', description: 'Ideal para fotografías' },
    { value: 'png', label: 'PNG', description: 'Transparencia y calidad' },
    { value: 'webp', label: 'WebP', description: 'Formato moderno y compacto' },
    { value: 'gif', label: 'GIF', description: 'Animaciones y colores limitados' },
    { value: 'bmp', label: 'BMP', description: 'Sin compresión' }
  ] as const;

  const handleFormatChange = (format: ConversionSettings['format']) => {
    onSettingsChange({ ...settings, format });
  };

  const handleQualityChange = (quality: number) => {
    onSettingsChange({ ...settings, quality });
  };

  const handleImageNamePrefixChange = (imageNamePrefix: string) => {
    onSettingsChange({ ...settings, imageNamePrefix });
  };

  const handleSdkSuffixChange = (sdkSuffix: string) => {
    onSettingsChange({ ...settings, sdkSuffix });
  };

  const handleProductDescriptionChange = (productDescription: string) => {
    onSettingsChange({ ...settings, productDescription });
  };

  const shouldShowQuality = settings.format === 'jpeg' || settings.format === 'webp';

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-1 border-b border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Sliders className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Configuración</h2>
        </div>
        
        <div className="space-y-6">
          {/* Formato de salida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Formato de salida
            </label>
            <select
              value={settings.format}
              onChange={(e) => handleFormatChange(e.target.value as ConversionSettings['format'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {formatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selecciona el formato de salida para las imágenes convertidas
            </p>
          </div>

          {/* Control de calidad */}
          {shouldShowQuality && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Calidad ({settings.quality}%)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Menor tamaño</span>
                <span>Mayor calidad</span>
              </div>
            </div>
          )}

          {/* Nomenclatura de imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nomenclatura de imágenes
            </label>
            <div className="space-y-4">
              {/* Prefijo del nombre */}
              <div>
                <label className="flex items-center text-sm text-gray-600 mb-2">
                  <Tag className="w-4 h-4 mr-2" />
                  Prefijo del nombre
                </label>
                <input
                  type="text"
                  value={settings.imageNamePrefix}
                  onChange={(e) => handleImageNamePrefixChange(e.target.value)}
                  placeholder="Ej: producto, imagen, foto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Palabra que aparecerá al inicio de cada imagen
                </p>
              </div>

              {/* Sufijo SDK */}
              <div>
                <label className="flex items-center text-sm text-gray-600 mb-2">
                  <Hash className="w-4 h-4 mr-2" />
                  SDK (ID unificado)
                </label>
                <input
                  type="text"
                  value={settings.sdkSuffix}
                  onChange={(e) => handleSdkSuffixChange(e.target.value)}
                  placeholder="Ej: A5455, SDK123, ID001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ID que se agregará al final de todas las imágenes
                </p>
              </div>
            </div>
          </div>

          {/* Descripción del producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Descripción del producto
            </label>
            <textarea
              value={settings.productDescription}
              onChange={(e) => handleProductDescriptionChange(e.target.value)}
              placeholder="Describe el producto, sus características, materiales, uso, etc. Esta información se usará para generar descripciones más precisas con ChatGPT."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Información adicional que ayudará a ChatGPT a generar descripciones más precisas
            </p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex-1 flex flex-col justify-end px-6 space-y-2">
        {/* ChatGPT Actions */}
        {chatGPTEnabled && (
          <>
            <button
              onClick={onGenerateDescriptions}
              disabled={imageCount === 0 || isGeneratingDescriptions || isConverting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <Brain className="w-5 h-5" />
              <span>
                {isGeneratingDescriptions ? 'Generando...' : 'Generar Descripciones'}
              </span>
            </button>
            
            {descriptionsCount > 0 && (
              <button
                onClick={onExportDescriptions}
                disabled={descriptionsCount === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>Exportar Descripciones ({descriptionsCount})</span>
              </button>
            )}
          </>
        )}

        {/* Conversion Actions */}
        <div className="space-y-2">
          <button
            onClick={onConvertOnly}
            disabled={imageCount === 0 || isConverting || isGeneratingDescriptions}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span>
              {isConverting ? 'Convirtiendo...' : 'Solo Convertir Imágenes'}
            </span>
          </button>

          <button
            onClick={onConvert}
            disabled={imageCount === 0 || isConverting || isGeneratingDescriptions}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Brain className="w-5 h-5" />
            <span>
              {isConverting ? 'Convirtiendo...' : 'Convertir + Generar Descripciones'}
            </span>
          </button>
        </div>

        {/* Download Actions */}
        {convertedCount > 0 && (
          <button
            onClick={onDownloadConverted}
            disabled={convertedCount === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>
              {convertedCount > 1 ? `Descargar ZIP (${convertedCount})` : 'Descargar Imagen'}
            </span>
          </button>
        )}
        
        <button
          onClick={onClearAll}
          disabled={imageCount === 0 || isConverting || isGeneratingDescriptions}
          className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Limpiar todo</span>
        </button>
      </div>
    </aside>
  );
};