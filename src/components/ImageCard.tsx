import React from 'react';
import { ImageData, ConversionSettings, ImageDescription } from '../types';
import { X, FileImage, Download, CheckCircle, FileDown } from 'lucide-react';
import { formatFileSize } from '../utils/formatFileSize';
import { convertSingleImage } from '../utils/imageConverter';

interface ImageCardProps {
  image: ImageData;
  onRemove: () => void;
  settings: ConversionSettings;
  onNotification: (notification: { type: 'success' | 'error'; title: string; message: string }) => void;
  description?: ImageDescription;
  onDownloadConverted?: (image: ImageData) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ 
  image, 
  onRemove, 
  settings, 
  onNotification,
  description,
  onDownloadConverted
}) => {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isDownloadingConverted, setIsDownloadingConverted] = React.useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await convertSingleImage(image, settings);
      onNotification({
        type: 'success',
        title: 'Descarga completada',
        message: `${image.name} se convirtió y descargó como ${settings.format.toUpperCase()}`
      });
    } catch (error) {
      onNotification({
        type: 'error',
        title: 'Error en la descarga',
        message: `No se pudo convertir ${image.name}`
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadConverted = async () => {
    if (!onDownloadConverted) return;
    
    setIsDownloadingConverted(true);
    try {
      await onDownloadConverted(image);
      onNotification({
        type: 'success',
        title: 'Descarga completada',
        message: `Imagen convertida y renombrada descargada correctamente`
      });
    } catch (error) {
      onNotification({
        type: 'error',
        title: 'Error en la descarga',
        message: `No se pudo descargar la imagen convertida`
      });
    } finally {
      setIsDownloadingConverted(false);
    }
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={image.url}
          alt={image.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-6 h-6 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-full flex items-center justify-center transition-colors"
            title="Descargar imagen convertida"
          >
            <Download className="w-3 h-3" />
          </button>
          {onDownloadConverted && (
            <button
              onClick={handleDownloadConverted}
              disabled={isDownloadingConverted}
              className="w-6 h-6 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-full flex items-center justify-center transition-colors"
              title="Descargar imagen convertida y renombrada"
            >
              <FileDown className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={onRemove}
            className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
            title="Eliminar imagen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex items-start space-x-2">
          <FileImage className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate" title={image.name}>
              {image.name}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span className="uppercase font-medium">
                {image.originalFormat}
              </span>
              <span>
                {formatFileSize(image.size)}
              </span>
            </div>
            {description && (
              <div className="flex items-center text-xs text-green-600 mt-1 font-medium">
                <CheckCircle className="w-3 h-3 mr-1" />
                Descripción generada
              </div>
            )}
            {isDownloading && (
              <div className="text-xs text-blue-600 mt-1 font-medium">
                Descargando...
              </div>
            )}
            {isDownloadingConverted && (
              <div className="text-xs text-green-600 mt-1 font-medium">
                Descargando convertida...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};