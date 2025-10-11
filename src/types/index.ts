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
}

export interface ChatGPTSettings {
  apiKey: string;
  model: 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4.1' | 'o3';
  enabled: boolean;
}

export interface PromptSettings {
  titlePrompt: string;
  descriptionPrompt: string;
  captionPrompt: string;
  altTextPrompt: string;
  useCustomPrompts: boolean;
}

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
  fullResponse?: string; // Respuesta completa de ChatGPT
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
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
}

export interface UserChatGPTSettings {
  apiKey: string;
  model: 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4.1' | 'o3';
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
}

export interface UserSettings {
  username: string;
  chatGPTSettings: UserChatGPTSettings;
  promptSettings: UserPromptSettings;
  conversionSettings: UserConversionSettings;
}

// Alias para compatibilidad con el código existente
export type ConversionSettings = UserConversionSettings;
export type ChatGPTSettings = UserChatGPTSettings;
export type PromptSettings = UserPromptSettings;