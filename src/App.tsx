import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Headre';
import { Sidebar } from './components/Sidebar';
import { ImageGrid } from './components/ImageGrid';
import { DropZone } from './components/DropZone';
import { NotificationContainer } from './components/NotificationContainer';
import { ChatGPTConfig } from './components/ChatGPTConfig';
import { PromptConfig } from './components/PromptConfig';
import { UsageHistory } from './components/UsageHistory';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { ImageData, ConversionSettings, ChatGPTSettings, PromptSettings, ImageDescription, Notification, AuthState, UserConversionSettings, UserChatGPTSettings, UserPromptSettings } from './types';
import { convertImages } from './utils/imageConverter';
import { ChatGPTService } from './services/chatgptService';
import { databaseService } from './services/databaseService';
import { authService } from './services/authService';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [settings, setSettings] = useState<UserConversionSettings>({
    format: 'png',
    quality: 90,
    imageNamePrefix: 'imagen',
    sdkSuffix: 'A5455',
    productDescription: ''
  });
  const [chatGPTSettings, setChatGPTSettings] = useState<UserChatGPTSettings>({
    apiKey: '',
    model: 'gpt-4o',
    enabled: false
  });
  const [promptSettings, setPromptSettings] = useState<UserPromptSettings>({
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
  const [currentPage, setCurrentPage] = useState<'main' | 'chatgpt-config' | 'prompt-config' | 'usage-history' | 'user-management'>('main');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
    isLoading: true
  });

  // Función para cargar configuración del usuario actual
  const loadConfiguration = useCallback(async () => {
    try {
      // Verificar autenticación
      const auth = authService.getAuthState();
      setAuthState(auth);
      
      if (auth.isAuthenticated && auth.currentUser) {
        const username = auth.currentUser.username;
        
        const userConversionSettings = await databaseService.getUserConversionSettings(username);
        const userChatGPTSettings = await databaseService.getUserChatGPTSettings(username);
        const userPromptSettings = await databaseService.getUserPromptSettings(username);
        
        setSettings(userConversionSettings);
        setChatGPTSettings(userChatGPTSettings);
        setPromptSettings(userPromptSettings);
        
        addNotification({
          type: 'success',
          title: 'Configuración cargada',
          message: `Se cargó la configuración de ${username} correctamente`
        });
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      addNotification({
        type: 'info',
        title: 'Configuración inicial',
        message: 'Se usará la configuración predeterminada'
      });
    }
  }, []);

  // Efecto para cargar configuración cuando el usuario está autenticado
  useEffect(() => {
    if (authState.isAuthenticated && authState.currentUser) {
      loadConfiguration();
    }
  }, [authState.isAuthenticated, authState.currentUser?.username]);

  // Efecto para inicializar la aplicación
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        await databaseService.initialize();
        
        // Verificar autenticación
        const auth = authService.getAuthState();
        setAuthState(auth);
        
        if (auth.isAuthenticated && auth.currentUser) {
          await loadConfiguration();
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Función para guardar configuración de conversión
  const saveConversionSettings = useCallback(async (newSettings: UserConversionSettings) => {
    try {
      if (authState.currentUser) {
        await databaseService.saveUserConversionSettings(authState.currentUser.username, newSettings);
      }
    } catch (error) {
      console.error('Error saving conversion settings:', error);
    }
  }, [authState.currentUser]);

  // Función para guardar configuración de ChatGPT
  const saveChatGPTSettings = useCallback(async (newSettings: UserChatGPTSettings) => {
    try {
      if (authState.currentUser) {
        await databaseService.saveUserChatGPTSettings(authState.currentUser.username, newSettings);
      }
    } catch (error) {
      console.error('Error saving ChatGPT settings:', error);
    }
  }, [authState.currentUser]);

  // Función para guardar configuración de prompts
  const savePromptSettings = useCallback(async (newSettings: UserPromptSettings) => {
    try {
      if (authState.currentUser) {
        await databaseService.saveUserPromptSettings(authState.currentUser.username, newSettings);
      }
    } catch (error) {
      console.error('Error saving prompt settings:', error);
    }
  }, [authState.currentUser]);

  // Función para limpiar configuración de ChatGPT
  const clearChatGPTSettings = useCallback(async () => {
    try {
      if (authState.currentUser) {
        const defaultSettings: UserChatGPTSettings = {
          apiKey: '',
          model: 'gpt-4o',
          enabled: false
        };
        await databaseService.saveUserChatGPTSettings(authState.currentUser.username, defaultSettings);
        setChatGPTSettings(defaultSettings);
        
        addNotification({
          type: 'success',
          title: 'Configuración limpiada',
          message: 'La configuración de ChatGPT se ha restablecido a los valores predeterminados'
        });
      }
    } catch (error) {
      console.error('Error clearing ChatGPT settings:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo limpiar la configuración de ChatGPT'
      });
    }
  }, [authState.currentUser]);

  // Función para limpiar configuración de prompts
  const clearPromptSettings = useCallback(async () => {
    try {
      if (authState.currentUser) {
        const defaultSettings: UserPromptSettings = {
          titlePrompt: "Genera un título atractivo y descriptivo para esta imagen (máximo 60 caracteres). El título debe ser claro, conciso y que capture la esencia del producto mostrado.",
          descriptionPrompt: "Describe detalladamente lo que ves en esta imagen. Incluye características visuales, colores, materiales, estilo y cualquier detalle relevante del producto (2-3 oraciones).",
          captionPrompt: "Crea una leyenda corta y atractiva para esta imagen que resalte las características principales del producto (1 oración).",
          altTextPrompt: "Genera un texto alternativo descriptivo para accesibilidad que describa claramente el contenido de la imagen (máximo 125 caracteres).",
          useCustomPrompts: false
        };
        await databaseService.saveUserPromptSettings(authState.currentUser.username, defaultSettings);
        setPromptSettings(defaultSettings);
        
        addNotification({
          type: 'success',
          title: 'Configuración limpiada',
          message: 'La configuración de prompts se ha restablecido a los valores predeterminados'
        });
      }
    } catch (error) {
      console.error('Error clearing prompt settings:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo limpiar la configuración de prompts'
      });
    }
  }, [authState.currentUser]);

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
  const handleConversionSettingsChange = useCallback((newSettings: UserConversionSettings) => {
    setSettings(newSettings);
    saveConversionSettings(newSettings);
  }, [saveConversionSettings]);

  // Función para manejar cambios en configuración de ChatGPT
  const handleChatGPTSettingsChange = useCallback((newSettings: UserChatGPTSettings) => {
    setChatGPTSettings(newSettings);
    saveChatGPTSettings(newSettings);
  }, [saveChatGPTSettings]);

  // Función para manejar cambios en configuración de prompts
  const handlePromptSettingsChange = useCallback((newSettings: UserPromptSettings) => {
    setPromptSettings(newSettings);
    savePromptSettings(newSettings);
  }, [savePromptSettings]);


  // Funciones de autenticación
  const handleLoginSuccess = useCallback(() => {
    const auth = authService.getAuthState();
    setAuthState(auth);
    addNotification({
      type: 'success',
      title: 'Bienvenido',
      message: `Hola ${auth.currentUser?.username}!`
    });
    // Recargar configuración del usuario
    loadConfiguration();
  }, [addNotification, loadConfiguration]);

  const handleLogout = useCallback(() => {
    // Limpiar todas las imágenes y estados relacionados
    setImages([]);
    setImageDescriptions([]);
    setConvertedImages([]);
    setIsGeneratingDescriptions(false);
    
    // Cerrar sesión
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      currentUser: null,
      isLoading: false
    });
    setCurrentPage('main');
    
    addNotification({
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente. Las imágenes han sido eliminadas.'
    });
  }, [addNotification]);

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
          model: 'gpt-4o',
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

  // Función para solo convertir imágenes (sin generar descripciones)
  const handleConvertOnly = useCallback(async () => {
    if (images.length === 0) {
      addNotification({
        type: 'error',
        title: 'No hay imágenes',
        message: 'Selecciona al menos una imagen para convertir'
      });
      return;
    }

    setIsConverting(true);
    const newConvertedImages: { blob: Blob; filename: string }[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // Convertir la imagen a Blob
        const blob = await convertSingleImageToBlob(image, settings);
        
        // Generar nombre de archivo
        const filename = generateFileName(image.name, settings, i + 1);
        
        newConvertedImages.push({ blob, filename });
      }

      setConvertedImages(newConvertedImages);
      
      addNotification({
        type: 'success',
        title: 'Conversión completada',
        message: `${images.length} imagen${images.length > 1 ? 'es' : ''} convertida${images.length > 1 ? 's' : ''} exitosamente`
      });
    } catch (error) {
      console.error('Error converting images:', error);
      addNotification({
        type: 'error',
        title: 'Error en la conversión',
        message: 'No se pudieron convertir las imágenes'
      });
    } finally {
      setIsConverting(false);
    }
  }, [images, settings, addNotification]);

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
    setIsGeneratingDescriptions(true);
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
        if (chatGPTSettings.enabled && chatGPTSettings.apiKey && chatGPTSettings.apiKey.trim()) {
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
            
            addNotification({
              type: 'info',
              title: 'Descripción generada',
              message: `Descripción generada para: ${image.name}`
            });
          } catch (error) {
            console.error(`Error generando descripción para ${image.name}:`, error);
            addNotification({
              type: 'warning',
              title: 'Error en descripción',
              message: `No se pudo generar descripción para: ${image.name} - ${error instanceof Error ? error.message : 'Error desconocido'}`
            });
            // Continuar sin descripción si falla
          }
        } else if (chatGPTSettings.enabled && (!chatGPTSettings.apiKey || !chatGPTSettings.apiKey.trim())) {
          addNotification({
            type: 'warning',
            title: 'ChatGPT no configurado',
            message: `ChatGPT está habilitado pero no hay API key configurada para: ${image.name}`
          });
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
      setIsGeneratingDescriptions(false);
    }
  }, [images, settings, chatGPTSettings, promptSettings, addNotification]);

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
        content += `${'='.repeat(80)}\n`;
        content += `\n`;
        content += `Texto alternativo: ${desc.altText}\n`;
        content += `Título: ${desc.title}\n`;
        content += `Leyenda: ${desc.caption}\n`;
        content += `Descripción: ${desc.description}\n`;
        content += `${'='.repeat(80)}\n`;
        content += `\n`;
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
      content += `${'='.repeat(80)}\n`;
      content += `\n`;
      content += `Texto alternativo: ${desc.altText}\n`;
      content += `Título: ${desc.title}\n`;
      content += `Leyenda: ${desc.caption}\n`;
      content += `Descripción: ${desc.description}\n`;
      content += `${'='.repeat(80)}\n`;
      content += `\n`;
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
        onClearSettings={clearChatGPTSettings}
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  if (currentPage === 'prompt-config') {
    return (
      <PromptConfig
        settings={promptSettings}
        onSettingsChange={handlePromptSettingsChange}
        onClearSettings={clearPromptSettings}
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  if (currentPage === 'usage-history') {
    return (
      <UsageHistory
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  if (currentPage === 'user-management') {
    return (
      <UserManagement
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  // Mostrar pantalla de carga mientras se inicializa
  if (isLoading || authState.isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar login si no está autenticado
  if (!authState.isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Header 
        onChatGPTConfig={() => setCurrentPage('chatgpt-config')}
        onPromptConfig={() => setCurrentPage('prompt-config')}
        onClearConfig={handleClearConfig}
        onUsageHistory={() => setCurrentPage('usage-history')}
        onUserManagement={() => setCurrentPage('user-management')}
        onLogout={handleLogout}
        currentUser={authState.currentUser}
      />
      
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          settings={settings}
          onSettingsChange={handleConversionSettingsChange}
          onConvert={handleConvert}
          onConvertOnly={handleConvertOnly}
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