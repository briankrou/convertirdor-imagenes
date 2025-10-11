import React, { useCallback } from 'react';
import { ImageData, ConversionSettings, ImageDescription } from '../types';
import { ImageCard } from './ImageCard';
import { Plus } from 'lucide-react';

interface ImageGridProps {
  images: ImageData[];
  onRemoveImage: (id: number) => void;
  onFilesSelected: (files: File[]) => void;
  settings: ConversionSettings;
  onNotification: (notification: { type: 'success' | 'error'; title: string; message: string }) => void;
  imageDescriptions?: ImageDescription[];
  onDownloadConverted?: (image: ImageData) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onRemoveImage,
  onFilesSelected,
  settings,
  onNotification,
  imageDescriptions = [],
  onDownloadConverted
}) => {
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFilesSelected(files);
    // Reset input
    e.target.value = '';
  }, [onFilesSelected]);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Imágenes cargadas ({images.length})
        </h2>
        <p className="text-sm text-gray-600">
          Revisa las imágenes antes de convertir. Puedes eliminar las que no necesites.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => {
          const description = imageDescriptions.find(desc => desc.id === image.id);
          return (
            <ImageCard
              key={image.id}
              image={image}
              onRemove={() => onRemoveImage(image.id)}
              settings={settings}
              onNotification={onNotification}
              description={description}
              onDownloadConverted={onDownloadConverted}
            />
          );
        })}
        
        {/* Botón para agregar más imágenes */}
        <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors group cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="add-more-input"
          />
          <label
            htmlFor="add-more-input"
            className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
          >
            <div className="w-12 h-12 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center mb-3 transition-colors">
              <Plus className="w-6 h-6 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              Agregar más
            </span>
            <span className="text-xs text-gray-500 mt-1">
              imágenes
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};