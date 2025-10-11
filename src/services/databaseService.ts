import { Low } from 'lowdb';
import { LocalStorage } from 'lowdb/browser';
import { ConversionSettings, ChatGPTSettings, PromptSettings, UserSettings, UserChatGPTSettings, UserPromptSettings, UserConversionSettings } from '../types';

interface DatabaseSchema {
  userSettings: { [username: string]: UserSettings };
  lastUpdated: string;
}

class DatabaseService {
  private db: Low<DatabaseSchema> | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const adapter = new LocalStorage<DatabaseSchema>('image-converter-db');
      this.db = new Low(adapter, {
        userSettings: {},
        lastUpdated: new Date().toISOString()
      });

      await this.db.read();
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
    
    if (!this.db!.data.userSettings[username]) {
      this.db!.data.userSettings[username] = this.getDefaultUserSettings(username);
      this.db!.data.lastUpdated = new Date().toISOString();
      await this.db!.write();
    }
    
    return this.db!.data.userSettings[username];
  }

  // Save user settings
  async saveUserSettings(username: string, settings: UserSettings): Promise<void> {
    await this.ensureInitialized();
    this.db!.data.userSettings[username] = settings;
    this.db!.data.lastUpdated = new Date().toISOString();
    await this.db!.write();
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
    this.db!.data.userSettings[username] = this.getDefaultUserSettings(username);
    this.db!.data.lastUpdated = new Date().toISOString();
    await this.db!.write();
  }

  // Delete user settings completely
  async deleteUserSettings(username: string): Promise<void> {
    await this.ensureInitialized();
    delete this.db!.data.userSettings[username];
    this.db!.data.lastUpdated = new Date().toISOString();
    await this.db!.write();
  }

  // Get all users with settings
  async getAllUsersWithSettings(): Promise<string[]> {
    await this.ensureInitialized();
    return Object.keys(this.db!.data.userSettings);
  }

  // Clear all user data
  async clearAllUserData(): Promise<void> {
    await this.ensureInitialized();
    this.db!.data.userSettings = {};
    this.db!.data.lastUpdated = new Date().toISOString();
    await this.db!.write();
  }

  // Get last updated timestamp
  async getLastUpdated(): Promise<string> {
    await this.ensureInitialized();
    return this.db!.data.lastUpdated;
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
