import { UserSettings, UserChatGPTSettings, UserPromptSettings, UserConversionSettings, UserPreferences, ContentMode, ContentModeConfig, ModePromptConfig, PerModeContext, AIProvider, AIProviderConfig, ModeModelConfig, Brand } from '../types';
import { DatabaseSync } from '../utils/dbSync';

interface DatabaseSchema {
  userSettings: { [username: string]: UserSettings };
  lastUpdated: string;
}

class DatabaseService {
  private data: DatabaseSchema | null = null;
  private isInitialized = false;
  private readonly dbPath = './src/db/db.json';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadData();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing database:', error);
      // En caso de error, crear estructura por defecto
      this.data = {
        userSettings: {},
        lastUpdated: new Date().toISOString()
      };
      this.isInitialized = true;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private async loadData(): Promise<void> {
    try {
      // Usar la utilidad de sincronización para cargar datos
      this.data = await DatabaseSync.syncData();
    } catch (error) {
      console.error('Error loading data:', error);
      // Si hay error al cargar, crear estructura por defecto
      this.data = {
        userSettings: {},
        lastUpdated: new Date().toISOString()
      };
      // No intentar guardar si hay problemas
    }
  }

  private async saveData(): Promise<void> {
    if (!this.data) return;

    this.data.lastUpdated = new Date().toISOString();

    // Guardar en localStorage como respaldo inmediato
    DatabaseSync.saveToLocalStorage(this.data);
    // Guardar en el servidor para persistencia real entre sesiones y dispositivos
    await DatabaseSync.saveToServer(this.data);
  }

  private getDefaultUserSettings(username: string): UserSettings {
    return {
      username,
      conversionSettings: {
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
      },
      chatGPTSettings: {
        apiKey: '',
        model: 'gpt-4.1',
        enabled: false
      },
      promptSettings: {
        titlePrompt: "Genera un título atractivo y descriptivo para esta imagen (máximo 60 caracteres). El título debe ser claro, conciso y que capture la esencia del producto mostrado.",
        descriptionPrompt: "Describe detalladamente lo que ves en esta imagen. Incluye características visuales, colores, materiales, estilo y cualquier detalle relevante del producto (2-3 oraciones).",
        captionPrompt: "Crea una leyenda corta y atractiva para esta imagen que resalte las características principales del producto (1 oración).",
        altTextPrompt: "Genera un texto alternativo descriptivo para accesibilidad que describa claramente el contenido de la imagen (máximo 125 caracteres).",
        useCustomPrompts: false
      },
      preferences: {
        currency: 'USD',
        language: 'es',
        timezone: 'America/Mexico_City'
      },
      defaultContentMode: 'ecommerce',
      customModes: []
    };
  }

  // Get user settings (creates default if doesn't exist)
  async getUserSettings(username: string): Promise<UserSettings> {
    await this.ensureInitialized();
    
    if (!this.data!.userSettings[username]) {
      this.data!.userSettings[username] = this.getDefaultUserSettings(username);
      await this.saveData();
    }
    
    return this.data!.userSettings[username];
  }

  // Save user settings
  async saveUserSettings(username: string, settings: UserSettings): Promise<void> {
    await this.ensureInitialized();
    this.data!.userSettings[username] = settings;
    await this.saveData();
  }

  // Get user conversion settings
  async getUserConversionSettings(username: string): Promise<UserConversionSettings> {
    const userSettings = await this.getUserSettings(username);
    return userSettings.conversionSettings;
  }

  // Save user conversion settings
  async saveUserConversionSettings(username: string, settings: UserConversionSettings): Promise<void> {
    const userSettings = await this.getUserSettings(username);
    userSettings.conversionSettings = settings;
    await this.saveUserSettings(username, userSettings);
  }

  // Get user ChatGPT settings
  async getUserChatGPTSettings(username: string): Promise<UserChatGPTSettings> {
    const userSettings = await this.getUserSettings(username);
    return userSettings.chatGPTSettings;
  }

  // Save user ChatGPT settings
  async saveUserChatGPTSettings(username: string, settings: UserChatGPTSettings): Promise<void> {
    const userSettings = await this.getUserSettings(username);
    userSettings.chatGPTSettings = settings;
    await this.saveUserSettings(username, userSettings);
  }

  // Get user prompt settings
  async getUserPromptSettings(username: string): Promise<UserPromptSettings> {
    const userSettings = await this.getUserSettings(username);
    return userSettings.promptSettings;
  }

  // Save user prompt settings
  async saveUserPromptSettings(username: string, settings: UserPromptSettings): Promise<void> {
    const userSettings = await this.getUserSettings(username);
    userSettings.promptSettings = settings;
    await this.saveUserSettings(username, userSettings);
  }

  // Clear user settings (reset to defaults)
  async clearUserSettings(username: string): Promise<void> {
    await this.ensureInitialized();
    this.data!.userSettings[username] = this.getDefaultUserSettings(username);
    await this.saveData();
  }

  // Delete user settings completely
  async deleteUserSettings(username: string): Promise<void> {
    await this.ensureInitialized();
    delete this.data!.userSettings[username];
    await this.saveData();
  }

  // Get all users with settings
  async getAllUsersWithSettings(): Promise<string[]> {
    await this.ensureInitialized();
    return Object.keys(this.data!.userSettings);
  }

  // Clear all user data
  async clearAllUserData(): Promise<void> {
    await this.ensureInitialized();
    this.data!.userSettings = {};
    await this.saveData();
  }


  // Métodos para preferencias de usuario
  async getUserPreferences(username: string): Promise<UserPreferences> {
    await this.ensureInitialized();
    
    if (!this.data) {
      throw new Error('Database not initialized');
    }

    const userSettings = this.data.userSettings[username];
    if (!userSettings || !userSettings.preferences) {
      // Retornar configuración por defecto
      return {
        currency: 'USD',
        language: 'es',
        timezone: 'America/Mexico_City'
      };
    }

    return userSettings.preferences;
  }

  async saveUserPreferences(username: string, preferences: UserPreferences): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.data) {
      throw new Error('Database not initialized');
    }

    // Asegurar que el usuario existe
    if (!this.data.userSettings[username]) {
      this.data.userSettings[username] = this.getDefaultUserSettings(username);
    }

    this.data.userSettings[username].preferences = preferences;
    this.data.lastUpdated = new Date().toISOString();
    await this.saveData();
  }

  async getUserContentMode(username: string): Promise<ContentMode> {
    const settings = await this.getUserSettings(username);
    return settings.defaultContentMode ?? 'ecommerce';
  }

  async saveUserContentMode(username: string, mode: ContentMode): Promise<void> {
    const settings = await this.getUserSettings(username);
    settings.defaultContentMode = mode;
    await this.saveUserSettings(username, settings);
  }

  async getUserCustomModes(username: string): Promise<ContentModeConfig[]> {
    const settings = await this.getUserSettings(username);
    return settings.customModes ?? [];
  }

  async saveUserCustomModes(username: string, modes: ContentModeConfig[]): Promise<void> {
    const settings = await this.getUserSettings(username);
    settings.customModes = modes;
    await this.saveUserSettings(username, settings);
  }

  // Get last updated timestamp
  async getLastUpdated(): Promise<string> {
    await this.ensureInitialized();
    return this.data!.lastUpdated;
  }

  // Export current data to file (for development)
  exportToFile(): void {
    DatabaseSync.exportToFile();
  }

  // Get current data for debugging
  async getCurrentData(): Promise<DatabaseSchema> {
    await this.ensureInitialized();
    return this.data!;
  }

  async getUserPerModeContext(username: string): Promise<PerModeContext> {
    const settings = await this.getUserSettings(username);
    return settings.perModeContext ?? {};
  }

  async saveUserPerModeContext(username: string, ctx: PerModeContext): Promise<void> {
    const settings = await this.getUserSettings(username);
    settings.perModeContext = ctx;
    await this.saveUserSettings(username, settings);
  }

  async getUserModePrompts(username: string): Promise<Partial<Record<string, ModePromptConfig>>> {
    const settings = await this.getUserSettings(username);
    return settings.modePrompts ?? {};
  }

  async saveUserModePrompts(username: string, prompts: Partial<Record<string, ModePromptConfig>>): Promise<void> {
    const settings = await this.getUserSettings(username);
    settings.modePrompts = prompts as Partial<Record<ContentMode, ModePromptConfig>>;
    await this.saveUserSettings(username, settings);
  }

  async getUserProviders(username: string): Promise<Partial<Record<AIProvider, AIProviderConfig>>> {
    const settings = await this.getUserSettings(username);
    return settings.providers ?? {};
  }

  async saveUserProviders(username: string, providers: Partial<Record<AIProvider, AIProviderConfig>>): Promise<void> {
    const settings = await this.getUserSettings(username);
    settings.providers = providers;
    await this.saveUserSettings(username, settings);
  }

  async getUserModeModels(username: string): Promise<Partial<Record<ContentMode, ModeModelConfig>>> {
    const settings = await this.getUserSettings(username);
    return settings.modeModels ?? {};
  }

  async saveUserModeModels(username: string, modeModels: Partial<Record<ContentMode, ModeModelConfig>>): Promise<void> {
    const settings = await this.getUserSettings(username);
    settings.modeModels = modeModels;
    await this.saveUserSettings(username, settings);
  }

  async getUserBrands(username: string): Promise<Brand[]> {
    const settings = await this.getUserSettings(username);
    return settings.brands ?? [];
  }

  async saveUserBrands(username: string, brands: Brand[]): Promise<void> {
    const settings = await this.getUserSettings(username);
    settings.brands = brands;
    await this.saveUserSettings(username, settings);
  }

}

// Export singleton instance
export const databaseService = new DatabaseService();
