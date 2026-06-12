export interface ImageData {
  id: number;
  file: File;
  name: string;
  size: number;
  url: string;
  originalFormat: string;
}

export interface ConversionSettings {
  format: 'jpeg' | 'png' | 'gif' | 'bmp' | 'webp';
  quality: number;
  imageNamePrefix: string;
  sdkSuffix: string;
  productDescription: string;
  resize: {
    enabled: boolean;
    width: number;
    height: number;
    maintainAspectRatio: boolean;
  };
}

export interface ChatGPTSettings {
  apiKey: string;
  model: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4.1' | 'gpt-4.1-mini' | 'gpt-4.1-nano' | 'o3' | 'o4-mini';
  enabled: boolean;
}

export interface PromptSettings {
  titlePrompt: string;
  descriptionPrompt: string;
  captionPrompt: string;
  altTextPrompt: string;
  useCustomPrompts: boolean;
}


export type ContentMode =
  | 'ecommerce'
  | 'services'
  | 'general'
  | 'social_media'
  | 'catalog'
  | 'custom';

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'openrouter';

export interface Brand {
  id: string;
  name: string;
  websiteUrl?: string;
  keywords?: string[];
  hashtags?: string[];
  tone?: string;
  industry?: string;
  language?: string;
  socialHandle?: string;
  logoUrl?: string;
  description?: string;
  createdAt: string;
}

export interface ConvertedImageEntry {
  blob: Blob;
  filename: string;
  imageId: number;
  originalSize: number;
  convertedSize: number;
}

export interface AIProviderConfig {
  apiKey: string;
  enabled: boolean;
}

export interface ModeModelConfig {
  provider: AIProvider;
  model: string;
}

export interface AIField {
  key: string;
  label: string;
  enabled: boolean;
  maxLength?: number;
}

export interface ContentModeConfig {
  id: ContentMode;
  label: string;
  icon: string;
  fields: AIField[];
  defaultPrompt: string;
}

export interface ModePromptConfig {
  useCustom: boolean;
  defaultPrompt: string;
  fieldPrompts: Record<string, string>; // field.key → instrucción personalizada
}

// Contexto específico por modo que se pasa como contexto adicional a la IA
export type PerModeContext = Partial<Record<ContentMode, Record<string, string>>>;

export interface ImageDescription {
  id: number;
  imageName: string;
  originalFilename: string;
  file: string;
  newFileName: string;
  title: string;
  description: string;
  caption: string;
  altText: string;
  fullResponse?: string;
  fields?: Record<string, string>;
  fieldLabels?: Record<string, string>;
  contentMode?: ContentMode;
}

export interface UsageRecord {
  id: string;
  timestamp: string;
  model: string;
  imageName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  success: boolean;
  error?: string;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  successfulRequests: number;
  failedRequests: number;
  averageCostPerRequest: number;
  mostUsedModel: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  isRoot: boolean;
  createdAt: string;
  lastLogin?: string;
  profileName?: string;
  profileImage?: string;
  currency?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
}

export interface UserChatGPTSettings {
  apiKey: string;
  model: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4.1' | 'gpt-4.1-mini' | 'gpt-4.1-nano' | 'o3' | 'o4-mini';
  enabled: boolean;
}

export interface UserPromptSettings {
  titlePrompt: string;
  descriptionPrompt: string;
  captionPrompt: string;
  altTextPrompt: string;
  useCustomPrompts: boolean;
}

export interface UserConversionSettings {
  format: 'jpeg' | 'png' | 'gif' | 'bmp' | 'webp';
  quality: number;
  imageNamePrefix: string;
  sdkSuffix: string;
  productDescription: string;
  resize: {
    enabled: boolean;
    width: number;
    height: number;
    maintainAspectRatio: boolean;
  };
}


export interface UserPreferences {
  currency: string;
  language?: string;
  timezone?: string;
}

export interface UserSettings {
  username: string;
  chatGPTSettings: UserChatGPTSettings;
  promptSettings: UserPromptSettings;
  conversionSettings: UserConversionSettings;
  preferences: UserPreferences;
  defaultContentMode?: ContentMode;
  customModes?: ContentModeConfig[];
  modePrompts?: Partial<Record<ContentMode, ModePromptConfig>>;
  perModeContext?: PerModeContext;
  providers?: Partial<Record<AIProvider, AIProviderConfig>>;
  modeModels?: Partial<Record<ContentMode, ModeModelConfig>>;
  brands?: Brand[];
}

// Alias para compatibilidad con el código existente
export type ConversionSettings = UserConversionSettings;
export type ChatGPTSettings = UserChatGPTSettings;
export type PromptSettings = UserPromptSettings;
export type Preferences = UserPreferences;