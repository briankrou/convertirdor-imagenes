import React from 'react';
import { Download, Trash2, Sliders, Package, Tag, Hash, Brain, FileText, Maximize2, Minimize2 } from 'lucide-react';
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
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' },
    { value: 'gif', label: 'GIF' },
    { value: 'bmp', label: 'BMP' }
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

  // Valores por defecto para resize
  const defaultResize = {
    enabled: false,
    width: 1920,
    height: 1080,
    maintainAspectRatio: true
  };

  const resizeSettings = settings.resize || defaultResize;

  const handleResizeEnabledChange = (enabled: boolean) => {
    onSettingsChange({ 
      ...settings, 
      resize: { ...resizeSettings, enabled }
    });
  };

  const handleResizeWidthChange = (width: number) => {
    onSettingsChange({ 
      ...settings, 
      resize: { ...resizeSettings, width }
    });
  };

  const handleResizeHeightChange = (height: number) => {
    onSettingsChange({ 
      ...settings, 
      resize: { ...resizeSettings, height }
    });
  };

  const handleMaintainAspectRatioChange = (maintainAspectRatio: boolean) => {
    onSettingsChange({ 
      ...settings, 
      resize: { ...resizeSettings, maintainAspectRatio }
    });
  };

  const shouldShowQuality = settings.format === 'jpeg' || settings.format === 'webp';

  return (
    <aside className="w-96 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-1 border-b border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Sliders className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Configuración</h2>
        </div>
        
        <div className="space-y-6">
          {/* Formato y Calidad */}
          <div className="grid grid-cols-2 gap-4">
            {/* Formato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato
              </label>
              <select
                value={settings.format}
                onChange={(e) => handleFormatChange(e.target.value as ConversionSettings['format'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {formatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Calidad (solo para JPEG y WebP) */}
            {shouldShowQuality && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calidad
                </label>
                <select
                  value={settings.quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="10">10% - Muy baja</option>
                  <option value="25">25% - Baja</option>
                  <option value="50">50% - Media</option>
                  <option value="75">75% - Buena</option>
                  <option value="90">90% - Alta</option>
                  <option value="95">95% - Muy alta</option>
                  <option value="100">100% - Máxima</option>
                </select>
              </div>
            )}
          </div>

          {/* Nomenclatura de imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nomenclatura de imágenes
            </label>
            <div className="grid grid-cols-2 gap-4">
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

          {/* Redimensionamiento de imágenes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Redimensionamiento
              </label>
              <button
                onClick={() => handleResizeEnabledChange(!resizeSettings.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  resizeSettings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    resizeSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {resizeSettings.enabled && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-2 gap-4">
                  {/* Ancho */}
                  <div>
                    <label className="flex items-center text-sm text-gray-600 mb-2">
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Ancho (px)
                    </label>
                    <input
                      type="number"
                      value={resizeSettings.width}
                      onChange={(e) => handleResizeWidthChange(parseInt(e.target.value) || 0)}
                      min="1"
                      max="10000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  {/* Alto */}
                  <div>
                    <label className="flex items-center text-sm text-gray-600 mb-2">
                      <Minimize2 className="w-4 h-4 mr-2" />
                      Alto (px)
                    </label>
                    <input
                      type="number"
                      value={resizeSettings.height}
                      onChange={(e) => handleResizeHeightChange(parseInt(e.target.value) || 0)}
                      min="1"
                      max="10000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Mantener proporción */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintainAspectRatio"
                    checked={resizeSettings.maintainAspectRatio}
                    onChange={(e) => handleMaintainAspectRatioChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="maintainAspectRatio" className="ml-2 text-sm text-gray-700">
                    Mantener proporción de aspecto
                  </label>
                </div>
                
                <p className="text-xs text-gray-500">
                  {resizeSettings.maintainAspectRatio 
                    ? 'Las imágenes se redimensionarán manteniendo su proporción original'
                    : 'Las imágenes se redimensionarán a las dimensiones exactas especificadas'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex-1 flex flex-col justify-end px-6 space-y-3">
        {/* Acciones principales - Grid de 2 columnas */}
        <div className="grid grid-cols-2 gap-2">
          {/* Solo Convertir */}
          <button
            onClick={onConvertOnly}
            disabled={imageCount === 0 || isConverting || isGeneratingDescriptions}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isConverting ? 'Convirtiendo...' : 'Solo Convertir'}
            </span>
            <span className="sm:hidden">
              {isConverting ? '...' : 'Convertir'}
            </span>
          </button>

          {/* Convertir + Generar */}
          <button
            onClick={onConvert}
            disabled={imageCount === 0 || isConverting || isGeneratingDescriptions}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isConverting ? 'Convirtiendo...' : 'Convertir + IA'}
            </span>
            <span className="sm:hidden">
              {isConverting ? '...' : 'IA'}
            </span>
          </button>
        </div>

        {/* Acciones de ChatGPT */}
        {chatGPTEnabled && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onGenerateDescriptions}
              disabled={imageCount === 0 || isGeneratingDescriptions || isConverting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isGeneratingDescriptions ? 'Generando...' : 'Solo IA'}
              </span>
              <span className="sm:hidden">
                {isGeneratingDescriptions ? '...' : 'IA'}
              </span>
            </button>
            
            {descriptionsCount > 0 && (
              <button
                onClick={onExportDescriptions}
                disabled={descriptionsCount === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar ({descriptionsCount})</span>
                <span className="sm:hidden">Exp ({descriptionsCount})</span>
              </button>
            )}
          </div>
        )}

        {/* Acciones de descarga y limpieza */}
        <div className="grid grid-cols-2 gap-2">
          {convertedCount > 0 && (
            <button
              onClick={onDownloadConverted}
              disabled={convertedCount === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">
                {convertedCount > 1 ? `ZIP (${convertedCount})` : 'Descargar'}
              </span>
              <span className="sm:hidden">
                {convertedCount > 1 ? `ZIP` : '↓'}
              </span>
            </button>
          )}
          
          <button
            onClick={onClearAll}
            disabled={imageCount === 0 || isConverting || isGeneratingDescriptions}
            className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Limpiar</span>
            <span className="sm:hidden">🗑️</span>
          </button>
        </div>
      </div>
    </aside>
  );
};