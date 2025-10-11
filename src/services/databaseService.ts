import { Low } from 'lowdb';
import { LocalStorage } from 'lowdb/browser';
import { ConversionSettings, ChatGPTSettings, PromptSettings } from '../types';

interface DatabaseSchema {
  conversionSettings: ConversionSettings;
  chatGPTSettings: ChatGPTSettings;
  promptSettings: PromptSettings;
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
        },
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

  // Conversion Settings
  async getConversionSettings(): Promise<ConversionSettings> {
    await this.ensureInitialized();
    return this.db!.data.conversionSettings;
  }

  async saveConversionSettings(settings: ConversionSettings): Promise<void> {
    await this.ensureInitialized();
    this.db!.data.conversionSettings = settings;
    this.db!.data.lastUpdated = new Date().toISOString();
    await this.db!.write();
  }

  // ChatGPT Settings
  async getChatGPTSettings(): Promise<ChatGPTSettings> {
    await this.ensureInitialized();
    return this.db!.data.chatGPTSettings;
  }

  async saveChatGPTSettings(settings: ChatGPTSettings): Promise<void> {
    await this.ensureInitialized();
    this.db!.data.chatGPTSettings = settings;
    this.db!.data.lastUpdated = new Date().toISOString();
    await this.db!.write();
  }

  // Prompt Settings
  async getPromptSettings(): Promise<PromptSettings> {
    await this.ensureInitialized();
    return this.db!.data.promptSettings;
  }

  async savePromptSettings(settings: PromptSettings): Promise<void> {
    await this.ensureInitialized();
    this.db!.data.promptSettings = settings;
    this.db!.data.lastUpdated = new Date().toISOString();
    await this.db!.write();
  }

  // Get all settings
  async getAllSettings(): Promise<{
    conversionSettings: ConversionSettings;
    chatGPTSettings: ChatGPTSettings;
    promptSettings: PromptSettings;
  }> {
    await this.ensureInitialized();
    return {
      conversionSettings: this.db!.data.conversionSettings,
      chatGPTSettings: this.db!.data.chatGPTSettings,
      promptSettings: this.db!.data.promptSettings
    };
  }

  // Save all settings
  async saveAllSettings(settings: {
    conversionSettings: ConversionSettings;
    chatGPTSettings: ChatGPTSettings;
    promptSettings: PromptSettings;
  }): Promise<void> {
    await this.ensureInitialized();
    this.db!.data.conversionSettings = settings.conversionSettings;
    this.db!.data.chatGPTSettings = settings.chatGPTSettings;
    this.db!.data.promptSettings = settings.promptSettings;
    this.db!.data.lastUpdated = new Date().toISOString();
    await this.db!.write();
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    this.db!.data = {
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
      },
      lastUpdated: new Date().toISOString()
    };
    await this.db!.write();
  }

  // Get last updated timestamp
  async getLastUpdated(): Promise<string> {
    await this.ensureInitialized();
    return this.db!.data.lastUpdated;
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
