import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Headre';
import { Sidebar } from './components/Sidebar';
import { ImageGrid } from './components/ImageGrid';
import { DropZone } from './components/DropZone';
import { NotificationContainer } from './components/NotificationContainer';
import { ChatGPTConfig } from './components/ChatGPTConfig';
import { PromptConfig } from './components/PromptConfig';
import { ImageData, ConversionSettings, ChatGPTSettings, PromptSettings, ImageDescription, Notification } from './types';
import { convertImages } from './utils/imageConverter';
import { ChatGPTService } from './services/chatgptService';
import { databaseService } from './services/databaseService';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    format: 'png',
    quality: 90,
    imageNamePrefix: 'imagen',
    sdkSuffix: 'A5455',
    productDescription: ''
  });
  const [chatGPTSettings, setChatGPTSettings] = useState<ChatGPTSettings>({
    apiKey: '',
    model: 'gpt-4-turbo',
    enabled: false
  });
  const [promptSettings, setPromptSettings] = useState<PromptSettings>({
    titlePrompt: "Genera un título atractivo y descriptivo para esta imagen (máximo 60 caracteres). El título debe ser claro, conciso y que capture la esencia del producto mostrado.",
    descriptionPrompt: "Describe detalladamente lo que ves en esta imagen. Incluye características visuales, colores, materiales, estilo y cualquier detalle relevante del producto (2-3 oraciones).",
    captionPrompt: "Crea una leyenda corta y atractiva para esta imagen que resalte las características principales del producto (1 oración).",
    altTextPrompt: "Genera un texto alternativo descriptivo para accesibilidad que describa claramente el contenido de la imagen (máximo 125 caracteres).",
    useCustomPrompts: false
  });
  const [imageDescriptions, setImageDescriptions] = useState<ImageDescription[]>([]);
  const [convertedImages, setConvertedImages] = useState<{ blob: Blob; filename: string }[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isGeneratingDescriptions, setIsGeneratingDescriptions] = useState(false);
  const [currentPage, setCurrentPage] = useState<'main' | 'chatgpt-config' | 'prompt-config'>('main');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar configuración al inicializar
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        setIsLoading(true);
        const allSettings = await databaseService.getAllSettings();
        
        setSettings(allSettings.conversionSettings);
        setChatGPTSettings(allSettings.chatGPTSettings);
        setPromptSettings(allSettings.promptSettings);
        
        addNotification({
          type: 'success',
          title: 'Configuración cargada',
          message: 'Se cargó la configuración guardada correctamente'
        });
      } catch (error) {
        console.error('Error loading configuration:', error);
        addNotification({
          type: 'info',
          title: 'Configuración inicial',
          message: 'Se usará la configuración predeterminada'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfiguration();
  }, []);

  // Función para guardar configuración de conversión
  const saveConversionSettings = useCallback(async (newSettings: ConversionSettings) => {
    try {
      await databaseService.saveConversionSettings(newSettings);
    } catch (error) {
      console.error('Error saving conversion settings:', error);
    }
  }, []);

  // Función para guardar configuración de ChatGPT
  const saveChatGPTSettings = useCallback(async (newSettings: ChatGPTSettings) => {
    try {
      await databaseService.saveChatGPTSettings(newSettings);
    } catch (error) {
      console.error('Error saving ChatGPT settings:', error);
    }
  }, []);

  // Función para guardar configuración de prompts
  const savePromptSettings = useCallback(async (newSettings: PromptSettings) => {
    try {
      await databaseService.savePromptSettings(newSettings);
    } catch (error) {
      console.error('Error saving prompt settings:', error);
    }
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    if (notification.type !== 'error') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleFilesSelected = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se encontraron archivos de imagen válidos'
      });
      return;
    }

    const newImages: ImageData[] = imageFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      originalFormat: file.type.split('/')[1]
    }));

    setImages(prev => [...prev, ...newImages]);
    
    addNotification({
      type: 'success',
      title: 'Imágenes cargadas',
      message: `Se cargaron ${imageFiles.length} imagen(es) correctamente`
    });
  }, [addNotification]);

  const handleRemoveImage = useCallback((id: number) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach(image => URL.revokeObjectURL(image.url));
    setImages([]);
    addNotification({
      type: 'info',
      title: 'Imágenes eliminadas',
      message: 'Todas las imágenes han sido eliminadas'
    });
  }, [images, addNotification]);

  // Función para manejar cambios en configuración de conversión
  const handleConversionSettingsChange = useCallback((newSettings: ConversionSettings) => {
    setSettings(newSettings);
    saveConversionSettings(newSettings);
  }, [saveConversionSettings]);

  // Función para manejar cambios en configuración de ChatGPT
  const handleChatGPTSettingsChange = useCallback((newSettings: ChatGPTSettings) => {
    setChatGPTSettings(newSettings);
    saveChatGPTSettings(newSettings);
  }, [saveChatGPTSettings]);

  // Función para manejar cambios en configuración de prompts
  const handlePromptSettingsChange = useCallback((newSettings: PromptSettings) => {
    setPromptSettings(newSettings);
    savePromptSettings(newSettings);
  }, [savePromptSettings]);

  // Función para descargar una imagen individual convertida y renombrada
  const handleDownloadSingleConverted = useCallback(async (image: ImageData) => {
    try {
      // Convertir la imagen a Blob
      const blob = await convertSingleImageToBlob(image, settings);
      
      // Generar nombre de archivo personalizado
      const filename = generateFileName(image.name, settings);
      
      // Crear URL y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Descarga completada',
        message: `Imagen convertida y renombrada como ${filename}`
      });
    } catch (error) {
      console.error('Error downloading single converted image:', error);
      addNotification({
        type: 'error',
        title: 'Error en la descarga',
        message: 'No se pudo descargar la imagen convertida'
      });
    }
  }, [settings, addNotification]);

  // Función para limpiar toda la configuración
  const handleClearConfig = useCallback(async () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar toda la configuración? Esta acción no se puede deshacer.')) {
      try {
        await databaseService.clearAllData();
        
        // Resetear a valores predeterminados
        const defaultConversionSettings: ConversionSettings = {
          format: 'png',
          quality: 90,
          imageNamePrefix: 'imagen',
          sdkSuffix: 'A5455',
          productDescription: ''
        };
        
        const defaultChatGPTSettings: ChatGPTSettings = {
          apiKey: '',
          model: 'gpt-4-turbo',
          enabled: false
        };
        
        const defaultPromptSettings: PromptSettings = {
          titlePrompt: "Genera un título atractivo y descriptivo para esta imagen (máximo 60 caracteres). El título debe ser claro, conciso y que capture la esencia del producto mostrado.",
          descriptionPrompt: "Describe detalladamente lo que ves en esta imagen. Incluye características visuales, colores, materiales, estilo y cualquier detalle relevante del producto (2-3 oraciones).",
          captionPrompt: "Crea una leyenda corta y atractiva para esta imagen que resalte las características principales del producto (1 oración).",
          altTextPrompt: "Genera un texto alternativo descriptivo para accesibilidad que describa claramente el contenido de la imagen (máximo 125 caracteres).",
          useCustomPrompts: false
        };
        
        setSettings(defaultConversionSettings);
        setChatGPTSettings(defaultChatGPTSettings);
        setPromptSettings(defaultPromptSettings);
        
        addNotification({
          type: 'success',
          title: 'Configuración limpiada',
          message: 'Se restauró la configuración predeterminada'
        });
      } catch (error) {
        console.error('Error clearing configuration:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo limpiar la configuración'
        });
      }
    }
  }, [addNotification]);

  const handleConvert = useCallback(async () => {
    if (images.length === 0) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No hay imágenes para convertir'
      });
      return;
    }

    setIsConverting(true);
    const newConvertedImages: { blob: Blob; filename: string }[] = [];
    const newDescriptions: ImageDescription[] = [];

    try {
      // Convertir imágenes y generar descripciones
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // Convertir imagen
        const convertedBlob = await convertSingleImageToBlob(image, settings);
        const filename = generateFileName(image.name, settings, i + 1);
        newConvertedImages.push({ blob: convertedBlob, filename });

        // Generar descripción si ChatGPT está habilitado
        if (chatGPTSettings.enabled && chatGPTSettings.apiKey) {
          try {
            const chatGPTService = new ChatGPTService(chatGPTSettings);
            const response = await chatGPTService.generateImageDescription(
              image, 
              settings.productDescription, 
              settings.imageNamePrefix,
              promptSettings
            );
            
            newDescriptions.push({
              id: image.id,
              imageName: image.name,
              title: response.title,
              description: response.description,
              caption: response.caption,
              altText: response.altText
            });
          } catch (error) {
            console.error(`Error generando descripción para ${image.name}:`, error);
            // Continuar sin descripción si falla
          }
        }

        addNotification({
          type: 'info',
          title: 'Progreso',
          message: `Procesando imagen ${i + 1} de ${images.length}: ${image.name}`
        });
      }

      setConvertedImages(newConvertedImages);
      setImageDescriptions(newDescriptions);
      
      addNotification({
        type: 'success',
        title: 'Conversión completada',
        message: `Se convirtieron ${images.length} imagen(es) y se generaron ${newDescriptions.length} descripción(es)`
      });

    } catch (error) {
      console.error('Error converting images:', error);
      addNotification({
        type: 'error',
        title: 'Error en la conversión',
        message: 'Ocurrió un error durante la conversión de las imágenes'
      });
    } finally {
      setIsConverting(false);
    }
  }, [images, settings, chatGPTSettings, addNotification]);

  // Función auxiliar para convertir una imagen a Blob
  const convertSingleImageToBlob = async (image: ImageData, settings: ConversionSettings): Promise<Blob> => {
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
  };

  // Función auxiliar para generar nombres de archivo
  const generateFileName = (originalName: string, settings: ConversionSettings, imageNumber?: number): string => {
    const { imageNamePrefix, sdkSuffix, format } = settings;
    
    if (imageNumber !== undefined) {
      // Para múltiples imágenes, usar prefijo + número secuencial + SDK
      return `${imageNamePrefix}_${imageNumber.toString().padStart(2, '0')}_${sdkSuffix}.${format}`;
    } else {
      // Para imagen única, usar prefijo + nombre original (sin extensión) + SDK
      const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
      return `${imageNamePrefix}_${nameWithoutExtension}_${sdkSuffix}.${format}`;
    }
  };

  // Funciones auxiliares para conversión
  const getMimeType = (format: ConversionSettings['format']): string => {
    const mimeTypes = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      webp: 'image/webp'
    };
    return mimeTypes[format];
  };

  const shouldUseQuality = (format: ConversionSettings['format']): boolean => {
    return format === 'jpeg' || format === 'webp';
  };

  const handleGenerateDescriptions = useCallback(async () => {
    if (!chatGPTSettings.enabled || !chatGPTSettings.apiKey) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'ChatGPT no está configurado. Ve a configuración para habilitarlo.'
      });
      return;
    }

    if (images.length === 0) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No hay imágenes para analizar'
      });
      return;
    }

    setIsGeneratingDescriptions(true);
    const chatGPTService = new ChatGPTService(chatGPTSettings);
    const newDescriptions: ImageDescription[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        try {
          const response = await chatGPTService.generateImageDescription(
            image, 
            settings.productDescription, 
            settings.imageNamePrefix,
            promptSettings
          );
          
          newDescriptions.push({
            id: image.id,
            imageName: image.name,
            title: response.title,
            description: response.description,
            caption: response.caption,
            altText: response.altText
          });

          addNotification({
            type: 'info',
            title: 'Progreso',
            message: `Analizada imagen ${i + 1} de ${images.length}: ${image.name}`
          });

        } catch (error) {
          console.error(`Error analizando ${image.name}:`, error);
          addNotification({
            type: 'error',
            title: 'Error',
            message: `No se pudo analizar ${image.name}`
          });
        }
      }

      setImageDescriptions(newDescriptions);
      
      if (newDescriptions.length > 0) {
        addNotification({
          type: 'success',
          title: 'Análisis completado',
          message: `Se generaron descripciones para ${newDescriptions.length} imagen(es)`
        });
      }

    } catch (error) {
      console.error('Error generando descripciones:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error general al generar descripciones'
      });
    } finally {
      setIsGeneratingDescriptions(false);
    }
  }, [images, chatGPTSettings, addNotification]);

  const handleExportDescriptions = useCallback(() => {
    if (imageDescriptions.length === 0) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No hay descripciones para exportar'
      });
      return;
    }

    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `descripciones-imagenes-${timestamp}.txt`;
      
      let content = '';

      imageDescriptions.forEach((desc, index) => {
        content += `${'='.repeat(80)}\n\n`;
        content += `Texto alternativo: ${desc.altText}\n`;
        content += `Título: ${desc.title}\n`;
        content += `Leyenda: ${desc.caption}\n`;
        content += `Descripción: ${desc.description}\n`;
        content += `${'='.repeat(80)}\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Archivo exportado',
        message: `Se descargó ${filename} con ${imageDescriptions.length} descripciones`
      });

    } catch (error) {
      console.error('Error exportando descripciones:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo exportar el archivo'
      });
    }
  }, [imageDescriptions, addNotification]);

  const handleDownloadConverted = useCallback(() => {
    if (convertedImages.length === 0) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No hay imágenes convertidas para descargar'
      });
      return;
    }

    try {
      if (convertedImages.length === 1) {
        // Descargar imagen única
        const { blob, filename } = convertedImages[0];
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        addNotification({
          type: 'success',
          title: 'Descarga completada',
          message: `Se descargó ${filename}`
        });
      } else {
        // Crear y descargar ZIP
        downloadAsZip(convertedImages, settings);
      }
    } catch (error) {
      console.error('Error downloading converted images:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron descargar las imágenes'
      });
    }
  }, [convertedImages, settings, addNotification]);

  // Función para generar archivo de metadatos
  const generateMetadataFile = (descriptions: ImageDescription[], settings: ConversionSettings): string => {
    let content = '';

    descriptions.forEach((desc, index) => {
      content += `${'='.repeat(80)}\n\n`;
      content += `Texto alternativo: ${desc.altText}\n`;
      content += `Título: ${desc.title}\n`;
      content += `Leyenda: ${desc.caption}\n`;
      content += `Descripción: ${desc.description}\n`;
      content += `${'='.repeat(80)}\n\n`;
    });

    return content;
  };

  // Función auxiliar para descargar como ZIP
  const downloadAsZip = async (files: { blob: Blob; filename: string }[], settings: ConversionSettings) => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Agregar cada archivo de imagen al ZIP
    files.forEach(({ blob, filename }) => {
      zip.file(filename, blob);
    });

    // Agregar archivo de metadatos si hay descripciones
    if (imageDescriptions.length > 0) {
      const metadataContent = generateMetadataFile(imageDescriptions, settings);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const metadataFilename = `metadatos-${settings.sdkSuffix}-${timestamp}.txt`;
      zip.file(metadataFilename, metadataContent);
    }
    
    // Generar el ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Descargar el ZIP
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const zipFilename = `imagenes-convertidas-${settings.sdkSuffix}-${settings.format}-${timestamp}.zip`;
    
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const message = imageDescriptions.length > 0 
      ? `Se descargó ${zipFilename} con ${files.length} imágenes y archivo de metadatos`
      : `Se descargó ${zipFilename} con ${files.length} imágenes`;

    addNotification({
      type: 'success',
      title: 'ZIP descargado',
      message: message
    });
  };

  if (currentPage === 'chatgpt-config') {
    return (
      <ChatGPTConfig
        settings={chatGPTSettings}
        onSettingsChange={handleChatGPTSettingsChange}
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  if (currentPage === 'prompt-config') {
    return (
      <PromptConfig
        settings={promptSettings}
        onSettingsChange={handlePromptSettingsChange}
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  // Mostrar pantalla de carga mientras se inicializa
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Header 
        onChatGPTConfig={() => setCurrentPage('chatgpt-config')}
        onPromptConfig={() => setCurrentPage('prompt-config')}
        onClearConfig={handleClearConfig}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          settings={settings}
          onSettingsChange={handleConversionSettingsChange}
          onConvert={handleConvert}
          onDownloadConverted={handleDownloadConverted}
          onClearAll={handleClearAll}
          onGenerateDescriptions={handleGenerateDescriptions}
          onExportDescriptions={handleExportDescriptions}
          isConverting={isConverting}
          isGeneratingDescriptions={isGeneratingDescriptions}
          imageCount={images.length}
          convertedCount={convertedImages.length}
          descriptionsCount={imageDescriptions.length}
          chatGPTEnabled={chatGPTSettings.enabled}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {images.length === 0 ? (
            <DropZone onFilesSelected={handleFilesSelected} />
          ) : (
        <ImageGrid 
          images={images}
          onRemoveImage={handleRemoveImage}
          onFilesSelected={handleFilesSelected}
          settings={settings}
          onNotification={addNotification}
          imageDescriptions={imageDescriptions}
          onDownloadConverted={handleDownloadSingleConverted}
        />
          )}
        </main>
      </div>
      
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}

export default App;