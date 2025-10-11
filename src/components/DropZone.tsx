import React, { useCallback } from 'react';
import { Upload, Image } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected }) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  }, [onFilesSelected]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFilesSelected(files);
    // Reset input
    e.target.value = '';
  }, [onFilesSelected]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div
        className={`w-full max-w-2xl mx-auto border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {isDragOver ? (
              <Upload className="w-8 h-8 text-blue-600" />
            ) : (
              <Image className="w-8 h-8 text-gray-600" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {isDragOver ? 'Suelta las imágenes aquí' : 'Arrastra tus imágenes aquí'}
            </h3>
            <p className="text-gray-500">
              O haz clic para seleccionar archivos desde tu computadora
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors"
            >
              Seleccionar imágenes
            </label>
            
            <div className="flex flex-wrap justify-center gap-0 text-xs text-gray-500">
              <span className="bg-gray-100 px-0 py-0 rounded">JPEG</span>
              <span className="bg-gray-100 px-0 py-0 rounded">PNG</span>
              <span className="bg-gray-100 px-0 py-0 rounded">GIF</span>
              <span className="bg-gray-100 px-0 py-0 rounded">BMP</span>
              <span className="bg-gray-100 px-0 py-0 rounded">WebP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};