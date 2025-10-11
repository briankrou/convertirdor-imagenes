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
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4.1' | 'o3' | 'o4-mini' | 'gpt-3.5-turbo';
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
  title: string;
  description: string;
  caption: string;
  altText: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}