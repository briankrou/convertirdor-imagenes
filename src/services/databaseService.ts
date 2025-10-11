import { UserSettings, UserChatGPTSettings, UserPromptSettings, UserConversionSettings } from '../types';
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
      throw error;
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
      await this.saveData();
    }
  }

  private async saveData(): Promise<void> {
    if (!this.data) return;
    
    this.data.lastUpdated = new Date().toISOString();
    
    // Guardar en localStorage usando la utilidad de sincronización
    DatabaseSync.saveToLocalStorage(this.data);
  }

  private getDefaultUserSettings(username: string): UserSettings {
    return {
      username,
      conversionSettings: {
        format: 'png',
        quality: 90,
        imageNamePrefix: 'imagen',
        sdkSuffix: 'A5455',
        productDescription: ''
      },
      chatGPTSettings: {
        apiKey: '',
        model: 'gpt-4o',
        enabled: false
      },
      promptSettings: {
        titlePrompt: "Genera un título atractivo y descriptivo para esta imagen (máximo 60 caracteres). El título debe ser claro, conciso y que capture la esencia del producto mostrado.",
        descriptionPrompt: "Describe detalladamente lo que ves en esta imagen. Incluye características visuales, colores, materiales, estilo y cualquier detalle relevante del producto (2-3 oraciones).",
        captionPrompt: "Crea una leyenda corta y atractiva para esta imagen que resalte las características principales del producto (1 oración).",
        altTextPrompt: "Genera un texto alternativo descriptivo para accesibilidad que describa claramente el contenido de la imagen (máximo 125 caracteres).",
        useCustomPrompts: false
      }
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

  // Legacy methods for backward compatibility (will be removed)
  async getConversionSettings(): Promise<ConversionSettings> {
    // This method is deprecated, use getUserConversionSettings instead
    throw new Error('This method is deprecated. Use getUserConversionSettings(username) instead.');
  }

  async saveConversionSettings(settings: ConversionSettings): Promise<void> {
    // This method is deprecated, use saveUserConversionSettings instead
    throw new Error('This method is deprecated. Use saveUserConversionSettings(username, settings) instead.');
  }

  async getChatGPTSettings(): Promise<ChatGPTSettings> {
    // This method is deprecated, use getUserChatGPTSettings instead
    throw new Error('This method is deprecated. Use getUserChatGPTSettings(username) instead.');
  }

  async saveChatGPTSettings(settings: ChatGPTSettings): Promise<void> {
    // This method is deprecated, use saveUserChatGPTSettings instead
    throw new Error('This method is deprecated. Use saveUserChatGPTSettings(username, settings) instead.');
  }

  async getPromptSettings(): Promise<PromptSettings> {
    // This method is deprecated, use getUserPromptSettings instead
    throw new Error('This method is deprecated. Use getUserPromptSettings(username) instead.');
  }

  async savePromptSettings(settings: PromptSettings): Promise<void> {
    // This method is deprecated, use saveUserPromptSettings instead
    throw new Error('This method is deprecated. Use saveUserPromptSettings(username, settings) instead.');
  }

  async getAllSettings(): Promise<{
    conversionSettings: ConversionSettings;
    chatGPTSettings: ChatGPTSettings;
    promptSettings: PromptSettings;
  }> {
    // This method is deprecated
    throw new Error('This method is deprecated. Use getUserSettings(username) instead.');
  }

  async saveAllSettings(settings: {
    conversionSettings: ConversionSettings;
    chatGPTSettings: ChatGPTSettings;
    promptSettings: PromptSettings;
  }): Promise<void> {
    // This method is deprecated
    throw new Error('This method is deprecated. Use saveUserSettings(username, settings) instead.');
  }

  async clearAllData(): Promise<void> {
    // This method is deprecated, use clearAllUserData instead
    throw new Error('This method is deprecated. Use clearAllUserData() instead.');
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
