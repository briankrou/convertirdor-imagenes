import { ImageData, ConversionSettings } from '../types';
import JSZip from 'jszip';

export async function convertSingleImage(
  image: ImageData,
  settings: ConversionSettings
): Promise<void> {
  try {
    const convertedBlob = await convertImage(image, settings);
    const filename = generateFileName(image.name, settings);
    downloadImage(convertedBlob, filename);
  } catch (error) {
    console.error(`Error converting ${image.name}:`, error);
    throw error;
  }
}

export async function convertImages(
  images: ImageData[],
  settings: ConversionSettings,
  onProgress?: (progress: number) => void
): Promise<void> {
  const totalImages = images.length;
  let processedImages = 0;
  const convertedFiles: { blob: Blob; filename: string }[] = [];

  // Si solo hay una imagen, descargarla directamente
  if (totalImages === 1) {
    try {
      const convertedBlob = await convertImage(images[0], settings);
      const filename = generateFileName(images[0].name, settings);
      downloadImage(convertedBlob, filename);
      onProgress?.(100);
      return;
    } catch (error) {
      console.error(`Error converting ${images[0].name}:`, error);
      throw error;
    }
  }

  // Para múltiples imágenes, convertir todas y crear un ZIP
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    try {
      const convertedBlob = await convertImage(image, settings);
      const filename = generateFileName(image.name, settings, i + 1);
      
      convertedFiles.push({
        blob: convertedBlob,
        filename: filename
      });
      
      processedImages++;
      onProgress?.(Math.round((processedImages / totalImages) * 100));
    } catch (error) {
      console.error(`Error converting ${image.name}:`, error);
      // Continuar con las demás imágenes en caso de error
    }
  }

  // Crear y descargar ZIP con todas las imágenes convertidas
  if (convertedFiles.length > 0) {
    await downloadAsZip(convertedFiles, settings);
  } else {
    throw new Error('No se pudieron convertir las imágenes');
  }
}

async function convertImage(
  image: ImageData,
  settings: ConversionSettings
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Clear canvas with white background for formats that don't support transparency
      if (settings.format === 'jpeg' || settings.format === 'bmp') {
        ctx!.fillStyle = 'white';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx!.drawImage(img, 0, 0);
      
      // Convert to the desired format
      const mimeType = getMimeType(settings.format);
      const quality = shouldUseQuality(settings.format) ? settings.quality / 100 : undefined;
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert image'));
        }
      }, mimeType, quality);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = image.url;
  });
}

async function downloadAsZip(
  files: { blob: Blob; filename: string }[],
  settings: ConversionSettings
): Promise<void> {
  const zip = new JSZip();
  
  // Agregar cada archivo al ZIP
  files.forEach(({ blob, filename }) => {
    zip.file(filename, blob);
  });
  
  // Generar el ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  // Descargar el ZIP
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const zipFilename = `imagenes-convertidas-${settings.sdkSuffix}-${settings.format}-${timestamp}.zip`;
  downloadImage(zipBlob, zipFilename);
}

function getMimeType(format: ConversionSettings['format']): string {
  const mimeTypes = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp'
  };
  
  return mimeTypes[format];
}

function shouldUseQuality(format: ConversionSettings['format']): boolean {
  return format === 'jpeg' || format === 'webp';
}

function generateFileName(originalName: string, settings: ConversionSettings, imageNumber?: number): string {
  const { imageNamePrefix, sdkSuffix, format } = settings;
  
  if (imageNumber !== undefined) {
    // Para múltiples imágenes, usar prefijo + número secuencial + SDK
    return `${imageNamePrefix}_${imageNumber.toString().padStart(2, '0')}_${sdkSuffix}.${format}`;
  } else {
    // Para imagen única, usar prefijo + nombre original (sin extensión) + SDK
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
    return `${imageNamePrefix}_${nameWithoutExtension}_${sdkSuffix}.${format}`;
  }
}

function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpiar el URL después de un breve delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}