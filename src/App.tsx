import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ImageGrid } from './components/ImageGrid';
import { DropZone } from './components/DropZone';
import { NotificationContainer } from './components/NotificationContainer';
import { ChatGPTConfig } from './components/ChatGPTConfig';
import { PromptConfig } from './components/PromptConfig';
import { CurrencyAPIConfig } from './components/CurrencyAPIConfig';
import { UsageHistory } from './components/UsageHistory';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { ProfileConfig } from './components/ProfileConfig';
import { Popup } from './components/Popup';
import { usePopup } from './hooks/usePopup';
import { ImageData, ImageDescription, Notification, AuthState, UserConversionSettings, UserChatGPTSettings, UserPromptSettings, ContentModeConfig, ModePromptConfig, PerModeContext, AIProvider, AIProviderConfig, ContentMode, ModeModelConfig, Brand, ConvertedImageEntry } from './types';
// import { convertImages } from './utils/imageConverter'; // No se está usando
import { ChatGPTService } from './services/chatgptService';
import { databaseService } from './services/databaseService';
import { authService } from './services/authService';
import { CONTENT_MODES, getActiveContext } from './services/contentModes';
import { ContentModeSelector } from './components/ContentModeSelector';
import { BrandsPanel } from './components/BrandsPanel';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [settings, setSettings] = useState<UserConversionSettings>({
    format: 'png',
    quality: 90,
    imageNamePrefix: 'imagen',
    sdkSuffix: 'A5455',
    productDescription: '',
    resize: {
      enabled: false,
      width: 1920,
      height: 1080,
      maintainAspectRatio: true
    }
  });
  const { popupState, hidePopup, showConfirm } = usePopup();
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
  const [convertedImages, setConvertedImages] = useState<ConvertedImageEntry[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isGeneratingDescriptions, setIsGeneratingDescriptions] = useState(false);
  const [activeContentMode, setActiveContentMode] = useState<ContentModeConfig>(CONTENT_MODES[0]);
  const [customModes, setCustomModes] = useState<ContentModeConfig[]>([]);
  const [modePrompts, setModePrompts] = useState<Partial<Record<string, ModePromptConfig>>>({});
  const [perModeContext, setPerModeContext] = useState<PerModeContext>({});
  const [aiProviders, setAiProviders] = useState<Partial<Record<AIProvider, AIProviderConfig>>>({});
  const [modeModels, setModeModels] = useState<Partial<Record<ContentMode, ModeModelConfig>>>({});
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentPage, setCurrentPage] = useState<'main' | 'chatgpt-config' | 'prompt-config' | 'currency-api-config' | 'usage-history' | 'user-management' | 'profile-config' | 'content-mode-selector' | 'brands-panel'>('main');
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
        const savedContentModeId = await databaseService.getUserContentMode(username);
        const savedCustomModes = await databaseService.getUserCustomModes(username);
        const savedModePrompts = await databaseService.getUserModePrompts(username);
        const savedPerModeContext = await databaseService.getUserPerModeContext(username);
        const savedAiProviders = await databaseService.getUserProviders(username);
        const savedModeModels = await databaseService.getUserModeModels(username);
        const savedBrands = await databaseService.getUserBrands(username);

        setSettings(userConversionSettings);
        setChatGPTSettings(userChatGPTSettings);
        setPromptSettings(userPromptSettings);
        setCustomModes(savedCustomModes);
        setModePrompts(savedModePrompts);
        setPerModeContext(savedPerModeContext);
        setAiProviders(savedAiProviders);
        setModeModels(savedModeModels);
        setBrands(savedBrands);

        const allModes = [...CONTENT_MODES, ...savedCustomModes];
        const savedMode = allModes.find(m => m.id === savedContentModeId) ?? CONTENT_MODES[0];
        setActiveContentMode(savedMode);
        
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
        console.log('🚀 Inicializando aplicación...');
        setIsLoading(true);
        
        
        console.log('📊 Inicializando base de datos...');
        await databaseService.initialize();
        console.log('✅ Base de datos inicializada');
        
        // Verificar autenticación
        console.log('🔐 Verificando autenticación...');
        const auth = authService.getAuthState();
        console.log('🔐 Estado de autenticación:', auth);
        setAuthState(auth);
        
        if (auth.isAuthenticated && auth.currentUser) {
          console.log('👤 Usuario autenticado, cargando configuración...');
          await loadConfiguration();
        }
        
        console.log('✅ Aplicación inicializada correctamente');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
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

  const handleModePromptsChange = useCallback(async (prompts: Partial<Record<string, ModePromptConfig>>) => {
    setModePrompts(prompts);
    if (authState.currentUser) {
      await databaseService.saveUserModePrompts(authState.currentUser.username, prompts);
    }
  }, [authState.currentUser]);

  const handleAiProvidersChange = useCallback(async (providers: Partial<Record<AIProvider, AIProviderConfig>>) => {
    setAiProviders(providers);
    if (authState.currentUser) {
      await databaseService.saveUserProviders(authState.currentUser.username, providers);
    }
  }, [authState.currentUser]);

  const handleModeModelsChange = useCallback(async (models: Partial<Record<ContentMode, ModeModelConfig>>) => {
    setModeModels(models);
    if (authState.currentUser) {
      await databaseService.saveUserModeModels(authState.currentUser.username, models);
    }
  }, [authState.currentUser]);

  const handleBrandsChange = useCallback(async (updated: Brand[]) => {
    setBrands(updated);
    if (authState.currentUser) {
      await databaseService.saveUserBrands(authState.currentUser.username, updated);
    }
  }, [authState.currentUser]);

  const handleApplyBrandToAllModes = useCallback(async (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;
    const STANDARD_MODES = ['ecommerce', 'services', 'general', 'social_media', 'catalog'] as const;
    const updated = { ...perModeContext };
    for (const modeId of STANDARD_MODES) {
      const base = updated[modeId] ?? {};
      const ctx: Record<string, string> = { ...base, selectedBrandId: brand.id };
      const filled: string[] = [];
      const set = (k: string, v: string) => { ctx[k] = v; filled.push(k); };
      if (brand.websiteUrl)       set('websiteUrl',        brand.websiteUrl);
      if (brand.keywords?.length) set('keyword',           brand.keywords[0]);
      if (brand.tone)             set('brandTone',         brand.tone);
      if (brand.description)      set('brandDescription',  brand.description);
      if (brand.industry)         set('brandIndustry',     brand.industry);
      if (brand.language)         set('brandLanguage',     brand.language);
      if (brand.hashtags?.length) set('brandHashtags',     brand.hashtags.join(' '));
      if (brand.socialHandle)     set('brandSocialHandle', brand.socialHandle);
      if (brand.name) {
        if (modeId === 'services')     set('companyName', brand.name);
        if (modeId === 'social_media') set('brand',       brand.name);
        if (modeId === 'catalog')      set('supplier',    brand.name);
      }
      ctx['_brandFilledFields'] = filled.join(',');
      updated[modeId] = ctx;
    }
    setPerModeContext(updated);
    if (authState.currentUser) {
      await databaseService.saveUserPerModeContext(authState.currentUser.username, updated);
    }
  }, [brands, perModeContext, authState.currentUser]);

  const handleSuggestKeywords = useCallback(async (name: string, description: string): Promise<string[]> => {
    const apiKey = chatGPTSettings.apiKey?.trim();
    if (!apiKey) return [];
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: chatGPTSettings.model ?? 'gpt-4.1-mini',
          messages: [{ role: 'user', content: `Sugiere 6 palabras clave SEO para la marca "${name}"${description ? `. Descripción: ${description}` : ''}. Responde solo con las palabras clave separadas por comas, sin numeración ni explicaciones.` }],
          max_tokens: 120,
        }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      const text: string = data.choices?.[0]?.message?.content ?? '';
      return text.split(',').map((k: string) => k.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }, [chatGPTSettings]);

  const handleModeContextChange = useCallback(async (ctx: Record<string, string>) => {
    const modeKey = activeContentMode.id;
    const updated: PerModeContext = { ...perModeContext, [modeKey]: ctx };
    setPerModeContext(updated);
    if (authState.currentUser) {
      await databaseService.saveUserPerModeContext(authState.currentUser.username, updated);
    }
  }, [activeContentMode.id, perModeContext, authState.currentUser]);

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
        await databaseService.saveUserModePrompts(authState.currentUser.username, {});
        setPromptSettings(defaultSettings);
        setModePrompts({});

        addNotification({
          type: 'success',
          title: 'Configuración limpiada',
          message: 'Los prompts de todos los modos se han restablecido'
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
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    showConfirm(
      'Limpiar todo',
      '¿Estás seguro de que quieres eliminar todas las imágenes, descripciones y resetear los campos de configuración?',
      () => {
        // Limpiar todas las imágenes y liberar memoria
        images.forEach(image => URL.revokeObjectURL(image.url));
        
        // Resetear estados relacionados con imágenes
        setImages([]);
        setImageDescriptions([]);
        setConvertedImages([]);
        setIsConverting(false);
        setIsGeneratingDescriptions(false);
        
        // Resetear configuración de conversión a valores predeterminados
        const defaultConversionSettings: ConversionSettings = {
          format: 'png',
          quality: 90,
          imageNamePrefix: 'imagen',
          sdkSuffix: 'A5455',
          productDescription: '',
          resize: {
            enabled: false,
            width: 1920,
            height: 1080,
            maintainAspectRatio: true
          }
        };
        
        setSettings(defaultConversionSettings);
        
        addNotification({
          type: 'info',
          title: 'Contenido y configuración limpiados',
          message: 'Se eliminaron todas las imágenes, descripciones y se reseteó la configuración de conversión'
        });
      },
      {
        confirmText: 'Limpiar todo',
        cancelText: 'Cancelar',
        type: 'warning'
      }
    );
  }, [images, addNotification, showConfirm]);

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


  const handleContentModeChange = useCallback(async (mode: ContentModeConfig) => {
    setActiveContentMode(mode);
    if (authState.currentUser) {
      await databaseService.saveUserContentMode(authState.currentUser.username, mode.id);
    }
    setCurrentPage('main');
  }, [authState.currentUser]);

  const handleCustomModesChange = useCallback(async (modes: ContentModeConfig[]) => {
    setCustomModes(modes);
    if (authState.currentUser) {
      await databaseService.saveUserCustomModes(authState.currentUser.username, modes);
    }
  }, [authState.currentUser]);

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

  // Función para manejar actualización del perfil
  const handleProfileUpdated = useCallback((updatedUser: User) => {
    setAuthState(prev => ({
      ...prev,
      currentUser: updatedUser
    }));
  }, []);

  // Función para limpiar toda la configuración
  const handleClearConfig = useCallback(async () => {
    showConfirm(
      'Limpiar toda la configuración',
      '¿Estás seguro de que quieres limpiar toda la configuración? Esta acción no se puede deshacer y eliminará:\n\n• Todas las imágenes cargadas\n• Todas las descripciones generadas\n• Toda la configuración de conversión\n• Toda la configuración de ChatGPT\n• Toda la configuración de prompts',
      async () => {
      try {
        // Limpiar datos de la base de datos
        await databaseService.clearAllData();
        
        // Limpiar todas las imágenes y liberar memoria
        images.forEach(image => URL.revokeObjectURL(image.url));
        
        // Resetear todos los estados a valores predeterminados
        setImages([]);
        setImageDescriptions([]);
        setConvertedImages([]);
        setIsConverting(false);
        setIsGeneratingDescriptions(false);
        
        // Resetear configuración de conversión
        const defaultConversionSettings: ConversionSettings = {
          format: 'png',
          quality: 90,
          imageNamePrefix: 'imagen',
          sdkSuffix: 'A5455',
          productDescription: '',
          resize: {
            enabled: false,
            width: 1920,
            height: 1080,
            maintainAspectRatio: true
          }
        };
        
        // Resetear configuración de ChatGPT
        const defaultChatGPTSettings: ChatGPTSettings = {
          apiKey: '',
          model: 'gpt-4o',
          enabled: false
        };
        
        // Resetear configuración de prompts
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
          title: 'Aplicación limpiada completamente',
          message: 'Se eliminaron todas las imágenes, descripciones y se restauró la configuración predeterminada'
        });
      } catch (error) {
        console.error('Error clearing configuration:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo limpiar la configuración'
        });
      }
      },
      {
        confirmText: 'Limpiar todo',
        cancelText: 'Cancelar',
        type: 'error'
      }
    );
  }, [addNotification, images, showConfirm]);

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
    const newConvertedImages: ConvertedImageEntry[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        // Convertir la imagen a Blob
        const blob = await convertSingleImageToBlob(image, settings);

        // Generar nombre de archivo
        const filename = generateFileName(image.name, settings, i + 1);

        newConvertedImages.push({ blob, filename, imageId: image.id, originalSize: image.size, convertedSize: blob.size });
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
    const newConvertedImages: ConvertedImageEntry[] = [];
    const newDescriptions: ImageDescription[] = [];

    try {
      // Convertir imágenes y generar descripciones
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // Convertir imagen
        const convertedBlob = await convertSingleImageToBlob(image, settings);
        const filename = generateFileName(image.name, settings, i + 1);
        newConvertedImages.push({ blob: convertedBlob, filename, imageId: image.id, originalSize: image.size, convertedSize: convertedBlob.size });

        // Generar descripción si ChatGPT está habilitado
        if (chatGPTSettings.enabled && chatGPTSettings.apiKey && chatGPTSettings.apiKey.trim()) {
          try {
            const chatGPTService = new ChatGPTService(chatGPTSettings, aiProviders);
            const activeModeKey = activeContentMode.id === 'custom' ? activeContentMode.label : activeContentMode.id;
            const aiContext = getActiveContext(activeContentMode.id, perModeContext, settings.productDescription);
            const response = await chatGPTService.generateImageDescription(
              image,
              aiContext,
              settings.imageNamePrefix,
              promptSettings,
              filename,
              activeContentMode,
              modePrompts[activeModeKey],
              modeModels[activeContentMode.id]
            );

            newDescriptions.push({
              id: image.id,
              imageName: image.name,
              originalFilename: image.name,
              file: response.file,
              newFileName: response.newFileName,
              title: response.title,
              description: response.description,
              caption: response.caption,
              altText: response.altText,
              fullResponse: response.fullResponse,
              fields: response.fields,
              fieldLabels: response.fieldLabels,
              contentMode: activeContentMode.id,
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
        let targetWidth = img.naturalWidth;
        let targetHeight = img.naturalHeight;
        
        // Aplicar redimensionamiento si está habilitado
        if (settings.resize && settings.resize.enabled) {
          if (settings.resize.maintainAspectRatio) {
            // Mantener proporción de aspecto
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const targetAspectRatio = settings.resize.width / settings.resize.height;
            
            if (aspectRatio > targetAspectRatio) {
              // La imagen es más ancha, ajustar por ancho
              targetWidth = settings.resize.width;
              targetHeight = settings.resize.width / aspectRatio;
            } else {
              // La imagen es más alta, ajustar por alto
              targetHeight = settings.resize.height;
              targetWidth = settings.resize.height * aspectRatio;
            }
          } else {
            // No mantener proporción, usar dimensiones exactas
            targetWidth = settings.resize.width;
            targetHeight = settings.resize.height;
          }
        }
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Clear canvas with white background for formats that don't support transparency
        if (settings.format === 'jpeg' || settings.format === 'bmp') {
          ctx!.fillStyle = 'white';
          ctx!.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Dibujar la imagen redimensionada
        ctx!.drawImage(img, 0, 0, targetWidth, targetHeight);
        
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
          // Generar nombre de archivo para la descripción
          const filename = generateFileName(image.name, settings, i + 1);
          
          const activeModeKeyGen = activeContentMode.id === 'custom' ? activeContentMode.label : activeContentMode.id;
          const aiContextGen = getActiveContext(activeContentMode.id, perModeContext, settings.productDescription);
          const response = await chatGPTService.generateImageDescription(
            image,
            aiContextGen,
            settings.imageNamePrefix,
            promptSettings,
            filename,
            activeContentMode,
            modePrompts[activeModeKeyGen]
          );

          newDescriptions.push({
            id: image.id,
            imageName: image.name,
            originalFilename: image.name,
            file: response.file,
            newFileName: response.newFileName,
            title: response.title,
            description: response.description,
            caption: response.caption,
            altText: response.altText,
            fullResponse: response.fullResponse,
            fields: response.fields,
            fieldLabels: response.fieldLabels,
            contentMode: activeContentMode.id,
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

  // Función auxiliar para agregar el nuevo nombre a la respuesta completa
  const addNewFileNameToResponse = (fullResponse: string, newFileName: string): string => {
    const lines = fullResponse.split('\n');
    let modifiedResponse = '';
    let foundFileLine = false;
    
    for (const line of lines) {
      modifiedResponse += line + '\n';
      
      // Si encontramos la línea "Archivo:", agregar "Nuevo nombre:" en la siguiente línea
      if (line.includes('Archivo:') && !foundFileLine) {
        modifiedResponse += `Nuevo nombre: ${newFileName}\n`;
        foundFileLine = true;
      }
    }
    
    // Si no se encontró la línea "Archivo:", agregar el nuevo nombre al principio
    if (!foundFileLine) {
      modifiedResponse = `Nuevo nombre: ${newFileName}\n` + modifiedResponse;
    }
    
    return modifiedResponse;
  };

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
      
      const content = generateMetadataFile(imageDescriptions);

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
  const generateMetadataFile = (descriptions: ImageDescription[]): string => {
    let content = '';

    descriptions.forEach((desc, index) => {
      const originalFilename = desc.file || desc.originalFilename || `imagen_${index + 1}`;
      content += `${'='.repeat(80)}\n`;
      content += `Archivo: ${originalFilename}\n`;
      content += `Nuevo nombre: ${desc.newFileName}\n`;

      if (desc.fields && Object.keys(desc.fields).length > 0) {
        // Modo dinámico: usar etiquetas reales de los campos
        Object.entries(desc.fields).forEach(([key, value]) => {
          const label = desc.fieldLabels?.[key] ?? key;
          content += `${label}: ${value}\n`;
        });
      } else {
        // Modo ecommerce legacy
        content += `Texto alternativo: ${desc.altText}\n`;
        content += `Título: ${desc.title}\n`;
        content += `Leyenda: ${desc.caption}\n`;
        content += `Descripción: ${desc.description}\n`;
      }

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
      const metadataContent = generateMetadataFile(imageDescriptions);
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
        aiProviders={aiProviders}
        onProvidersChange={handleAiProvidersChange}
        modeModels={modeModels}
        onModeModelsChange={handleModeModelsChange}
        onClearSettings={clearChatGPTSettings}
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  if (currentPage === 'prompt-config') {
    return (
      <PromptConfig
        settings={promptSettings}
        modePrompts={modePrompts}
        customModes={customModes}
        activeMode={activeContentMode}
        onSettingsChange={handlePromptSettingsChange}
        onModePromptsChange={handleModePromptsChange}
        onClearSettings={clearPromptSettings}
        onBack={() => setCurrentPage('main')}
      />
    );
  }


  if (currentPage === 'currency-api-config') {
    return (
      <CurrencyAPIConfig
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

  if (currentPage === 'profile-config') {
    return (
      <ProfileConfig
        currentUser={authState.currentUser!}
        onBack={() => setCurrentPage('main')}
        onProfileUpdated={handleProfileUpdated}
      />
    );
  }

  if (currentPage === 'content-mode-selector') {
    return (
      <ContentModeSelector
        activeMode={activeContentMode}
        customModes={customModes}
        onModeChange={handleContentModeChange}
        onCustomModesChange={handleCustomModesChange}
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  if (currentPage === 'brands-panel') {
    return (
      <BrandsPanel
        brands={brands}
        onBrandsChange={handleBrandsChange}
        onBack={() => setCurrentPage('main')}
        onSuggestKeywords={handleSuggestKeywords}
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
        onCurrencyAPIConfig={() => setCurrentPage('currency-api-config')}
        onClearConfig={handleClearConfig}
        onUsageHistory={() => setCurrentPage('usage-history')}
        onUserManagement={() => setCurrentPage('user-management')}
        onBrandsPanel={() => setCurrentPage('brands-panel')}
        onProfileConfig={() => setCurrentPage('profile-config')}
        onLogout={handleLogout}
        currentUser={authState.currentUser}
      />
      
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          settings={settings}
          activeMode={activeContentMode}
          modeContext={perModeContext[activeContentMode.id] ?? {}}
          onSettingsChange={handleConversionSettingsChange}
          onModeContextChange={handleModeContextChange}
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
          brands={brands}
          onManageBrands={() => setCurrentPage('brands-panel')}
          onApplyBrandToAllModes={handleApplyBrandToAllModes}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Barra de modo activo */}
          <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="text-gray-400">Modo:</span>
              <span className="font-medium text-gray-800">{activeContentMode.label}</span>
              {activeContentMode.fields.length > 0 && (
                <span className="text-gray-400">
                  ({activeContentMode.fields.filter(f => f.enabled).map(f => f.label).join(', ')})
                </span>
              )}
            </div>
            <button
              onClick={() => setCurrentPage('content-mode-selector')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Cambiar modo
            </button>
          </div>

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
              convertedImages={convertedImages}
            />
          )}
        </main>
      </div>
      
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Popup */}
      <Popup
        isOpen={popupState.isOpen}
        onClose={hidePopup}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        onConfirm={popupState.onConfirm}
        onCancel={popupState.onCancel}
        confirmText={popupState.confirmText}
        cancelText={popupState.cancelText}
        showButtons={popupState.showButtons}
      />
    </div>
  );
}

export default App;