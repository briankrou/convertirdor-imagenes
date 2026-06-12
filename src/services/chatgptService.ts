import { ImageData, UsageRecord, UserChatGPTSettings, UserPromptSettings, ContentModeConfig, ModePromptConfig, AIProvider, AIProviderConfig, ModeModelConfig } from '../types';
import { authService } from './authService';
import { buildPrompt, getEffectiveFields } from './contentModes';
import { getPricing } from './aiProviders';

export interface ChatGPTResponse {
  file: string;
  newFileName: string;
  title: string;
  description: string;
  caption: string;
  altText: string;
  fullResponse?: string;
  fields?: Record<string, string>;
  fieldLabels?: Record<string, string>;
}

interface ProviderCallResult {
  text: string;
  promptTokens: number;
  completionTokens: number;
}

export class ChatGPTService {
  private settings: UserChatGPTSettings;
  private providerConfigs: Partial<Record<AIProvider, AIProviderConfig>>;

  constructor(
    settings: UserChatGPTSettings,
    providerConfigs?: Partial<Record<AIProvider, AIProviderConfig>>
  ) {
    this.settings = settings;
    this.providerConfigs = providerConfigs ?? {};
  }

  private calculateCost(promptTokens: number, completionTokens: number, provider: AIProvider, model: string): number {
    const pricing = getPricing(provider, model);
    if (!pricing) return 0;
    return (promptTokens / 1000) * pricing.input + (completionTokens / 1000) * pricing.output;
  }

  private saveUsageRecord(record: UsageRecord): void {
    try {
      const existing = localStorage.getItem('chatgpt-usage-history');
      const records: UsageRecord[] = existing ? JSON.parse(existing) : [];
      records.push(record);
      localStorage.setItem('chatgpt-usage-history', JSON.stringify(records));

      const adminBackup = localStorage.getItem('chatgpt-usage-history-admin-backup');
      const adminRecords: UsageRecord[] = adminBackup ? JSON.parse(adminBackup) : [];
      adminRecords.push(record);
      localStorage.setItem('chatgpt-usage-history-admin-backup', JSON.stringify(adminRecords));
    } catch (error) {
      console.error('Error saving usage record:', error);
    }
  }

  // ── Provider-specific API calls ───────────────────────────────────────────

  private async callOpenAI(
    base64Image: string,
    prompt: string,
    model: string,
    apiKey: string
  ): Promise<ProviderCallResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(this.parseHttpError(response.status, errorData?.error?.message));
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    return {
      text,
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
    };
  }

  private async callAnthropic(
    base64Image: string,
    prompt: string,
    model: string,
    apiKey: string
  ): Promise<ProviderCallResult> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(this.parseHttpError(response.status, errorData?.error?.message));
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';
    return {
      text,
      promptTokens: data.usage?.input_tokens ?? 0,
      completionTokens: data.usage?.output_tokens ?? 0,
    };
  }

  private async callOpenRouter(
    base64Image: string,
    prompt: string,
    model: string,
    apiKey: string
  ): Promise<ProviderCallResult> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Image Converter AI',
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(this.parseHttpError(response.status, errorData?.error?.message));
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    return {
      text,
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
    };
  }

  private async callGoogle(
    base64Image: string,
    prompt: string,
    model: string,
    apiKey: string
  ): Promise<ProviderCallResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
            { text: prompt },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(this.parseHttpError(response.status, errorData?.error?.message));
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return {
      text,
      promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
      completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
    };
  }

  private async dispatchCall(
    base64Image: string,
    prompt: string,
    provider: AIProvider,
    model: string
  ): Promise<ProviderCallResult> {
    let apiKey: string;
    if (provider === 'openai') {
      apiKey = this.settings.apiKey;
    } else {
      const cfg = this.providerConfigs[provider];
      if (!cfg?.apiKey?.trim()) throw new Error(`API key no configurada para ${provider}`);
      apiKey = cfg.apiKey;
    }

    if (provider === 'openai') return this.callOpenAI(base64Image, prompt, model, apiKey);
    if (provider === 'anthropic') return this.callAnthropic(base64Image, prompt, model, apiKey);
    if (provider === 'google') return this.callGoogle(base64Image, prompt, model, apiKey);
    if (provider === 'openrouter') return this.callOpenRouter(base64Image, prompt, model, apiKey);
    throw new Error(`Proveedor no soportado: ${provider}`);
  }

  private parseHttpError(status: number, message?: string): string {
    if (status === 401) return 'API key inválida o expirada';
    if (status === 429) return 'Límite de solicitudes excedido. Intenta más tarde';
    if (status === 413) return 'La imagen es demasiado grande';
    if (status === 500) return 'Error interno del servidor de IA';
    return message ?? `Error HTTP ${status}`;
  }

  // ── Main method ───────────────────────────────────────────────────────────

  async generateImageDescription(
    imageData: ImageData,
    productDescription?: string,
    namePrefix?: string,
    promptSettings?: UserPromptSettings,
    newFileName?: string,
    contentMode?: ContentModeConfig,
    modePromptConfig?: ModePromptConfig,
    modeModel?: ModeModelConfig,
    rawContext?: Record<string, string>
  ): Promise<ChatGPTResponse> {
    const provider: AIProvider = modeModel?.provider ?? 'openai';
    const model: string = modeModel?.model ?? this.settings.model;

    // Validate credentials
    if (provider === 'openai') {
      if (!this.settings.enabled || !this.settings.apiKey) {
        throw new Error('ChatGPT no está configurado o habilitado');
      }
    } else {
      const cfg = this.providerConfigs[provider];
      if (!cfg?.enabled || !cfg?.apiKey?.trim()) {
        throw new Error(`El proveedor ${provider} no está habilitado o no tiene API key`);
      }
    }

    try {
      const validation = await this.validateImage(imageData);
      if (!validation.isValid) throw new Error(validation.error ?? 'La imagen no es válida');

      const base64Image = await this.convertImageToBase64(imageData.url);

      const useJsonMode = contentMode && contentMode.id !== 'ecommerce';

      let prompt: string;
      if (useJsonMode) {
        prompt = buildPrompt(contentMode!, imageData.name, productDescription, namePrefix, modePromptConfig, rawContext);
      } else {
        const prompts = promptSettings?.useCustomPrompts ? promptSettings : {
          titlePrompt: "Genera un título atractivo y descriptivo para esta imagen (máximo 60 caracteres). El título debe ser claro, conciso y que capture la esencia del producto mostrado.",
          descriptionPrompt: "Describe detalladamente lo que ves en esta imagen. Incluye características visuales, colores, materiales, estilo y cualquier detalle relevante del producto (2-3 oraciones).",
          captionPrompt: "Crea una leyenda corta y atractiva para esta imagen que resalte las características principales del producto (1 oración).",
          altTextPrompt: "Genera un texto alternativo descriptivo para accesibilidad que describa claramente el contenido de la imagen (máximo 125 caracteres).",
        };

        prompt = `Analiza esta imagen específica y proporciona la descripción en el siguiente formato exacto:

================================================================================

Archivo: ${imageData.name}
Texto alternativo: [${prompts.altTextPrompt}]
Título: [${prompts.titlePrompt}]
Leyenda: [${prompts.captionPrompt}]
Descripción: [${prompts.descriptionPrompt}]
================================================================================

IMPORTANTE:
- Responde ÚNICAMENTE con el formato mostrado arriba, reemplazando los corchetes con el contenido generado
- NO uses formato JSON, NO agregues texto adicional, NO uses comillas
- Incluye la línea "Archivo:" seguida del nombre del archivo
- NO uses asteriscos (*) en los campos, solo los nombres de los campos seguidos de dos puntos
- Usa "Archivo:" (con A mayúscula) seguido del nombre del archivo`;

        if (productDescription?.trim()) prompt += `\n\nCONTEXTO ADICIONAL DEL PRODUCTO: ${productDescription}`;
        if (namePrefix?.trim()) prompt += `\n\nPREFIJO DEL PRODUCTO: ${namePrefix}`;
        if (productDescription?.trim() || namePrefix?.trim()) {
          prompt += `\n\nUsa esta información de contexto para generar contenido más preciso, pero enfócate en describir específicamente lo que ves en esta imagen particular.`;
        }
      }

      const { text: content, promptTokens, completionTokens } = await this.dispatchCall(
        base64Image, prompt, provider, model
      );

      if (!content) throw new Error('No se recibió respuesta del modelo de IA');

      const cost = this.calculateCost(promptTokens, completionTokens, provider, model);
      const currentUser = authService.getCurrentUser();
      this.saveUsageRecord({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        model: `${provider}/${model}`,
        imageName: `${currentUser?.username ?? 'unknown'}_${imageData.name}`,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        cost,
        success: true,
      });

      if (useJsonMode && contentMode) {
        try {
          const cleanContent = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          return this.parseJsonModeResponse(JSON.parse(cleanContent), contentMode, imageData.name, newFileName, rawContext);
        } catch {
          return this.parseTextResponse(content, imageData.name, newFileName);
        }
      }

      try {
        const parsed = JSON.parse(content);
        return {
          file: parsed.file || imageData.name,
          newFileName: newFileName || imageData.name,
          title: parsed.title || 'Título no disponible',
          description: parsed.description || 'Descripción no disponible',
          caption: parsed.caption || 'Leyenda no disponible',
          altText: parsed.altText || 'Texto alternativo no disponible',
          fullResponse: content,
        };
      } catch {
        return this.parseTextResponse(content, imageData.name, newFileName);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const currentUser = authService.getCurrentUser();
      this.saveUsageRecord({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        model: `${provider}/${model}`,
        imageName: `${currentUser?.username ?? 'unknown'}_${imageData.name}`,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        success: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async convertImageToBase64(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('No se pudo obtener el contexto del canvas')); return; }
        canvas.width = img.width;
        canvas.height = img.height;
        try {
          ctx.drawImage(img, 0, 0);
          let base64: string;
          try {
            base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          } catch {
            base64 = canvas.toDataURL('image/png').split(',')[1];
          }
          if (!base64 || base64.length < 100) { reject(new Error('La imagen convertida está vacía')); return; }
          resolve(base64);
        } catch (e) {
          reject(new Error(`Error convirtiendo imagen a base64: ${e instanceof Error ? e.message : e}`));
        }
      };
      img.onerror = () => reject(new Error(`Error cargando imagen: ${imageUrl}`));
      setTimeout(() => reject(new Error('Timeout cargando imagen')), 30000);
      img.src = imageUrl;
    });
  }

  private parseJsonModeResponse(
    json: Record<string, unknown>,
    config: ContentModeConfig,
    imageName: string,
    newFileName?: string,
    rawContext?: Record<string, string>
  ): ChatGPTResponse {
    const fields: Record<string, string> = {};
    const fieldLabels: Record<string, string> = {};

    // Usar solo los campos efectivos para el modo y contexto actual
    const effectiveFields = getEffectiveFields(config, rawContext);

    effectiveFields.forEach((field: any) => {
      const value = json[field.key];
      if (value !== undefined) {
        fields[field.key] = String(value);
        fieldLabels[field.key] = field.label;
      }
    });

    return {
      file: imageName,
      newFileName: newFileName || imageName,
      title: fields['title'] ?? fields['name'] ?? 'Sin título',
      description: fields['description'] ?? fields['description_benefits'] ?? 'Sin descripción',
      caption: fields['caption'] ?? fields['cta'] ?? fields['hashtags'] ?? 'Sin caption',
      altText: fields['alt_text'] ?? fields['altText'] ?? 'Sin texto alternativo',
      fullResponse: JSON.stringify(json, null, 2),
      fields,
      fieldLabels,
    };
  }

  private parseTextResponse(text: string, imageName?: string, newFileName?: string): ChatGPTResponse {
    const lines = text.split('\n').filter(l => l.trim());
    let file = imageName ?? 'Archivo no disponible';
    let title = 'Título no disponible';
    let description = 'Descripción no disponible';
    let caption = 'Leyenda no disponible';
    let altText = 'Texto alternativo no disponible';

    for (const line of lines) {
      if (line.includes('Archivo:')) file = line.replace('Archivo:', '').trim();
      else if (line.includes('Texto alternativo:')) altText = line.replace('Texto alternativo:', '').trim();
      else if (line.includes('Título:')) title = line.replace('Título:', '').trim();
      else if (line.includes('Leyenda:')) caption = line.replace('Leyenda:', '').trim();
      else if (line.includes('Descripción:')) description = line.replace('Descripción:', '').trim();
    }

    return { file, newFileName: newFileName ?? imageName ?? 'Archivo no disponible', title, description, caption, altText, fullResponse: text };
  }

  // ── Connection tests ──────────────────────────────────────────────────────

  static async testProviderConnection(provider: AIProvider, apiKey: string): Promise<boolean> {
    try {
      if (provider === 'openai') {
        const r = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        return r.ok;
      }
      if (provider === 'anthropic') {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }],
          }),
        });
        return r.status !== 401 && r.status !== 403;
      }
      if (provider === 'google') {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        return r.ok;
      }
      if (provider === 'openrouter') {
        const r = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        return r.ok;
      }
      return false;
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    return ChatGPTService.testProviderConnection('openai', this.settings.apiKey);
  }

  async testImageAnalysis(imageData: ImageData): Promise<{ success: boolean; error?: string; details?: unknown }> {
    if (!this.settings.enabled || !this.settings.apiKey) {
      return { success: false, error: 'ChatGPT no está configurado' };
    }
    try {
      const validation = await this.validateImage(imageData);
      if (!validation.isValid) return { success: false, error: validation.error };

      const base64Image = await this.convertImageToBase64(imageData.url);
      const { text: content, promptTokens, completionTokens } = await this.callOpenAI(
        base64Image,
        'Describe brevemente lo que ves en esta imagen.',
        this.settings.model,
        this.settings.apiKey
      );
      return { success: true, details: { content, usage: { promptTokens, completionTokens } } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  async validateImage(imageData: ImageData): Promise<{ isValid: boolean; error?: string }> {
    if (!imageData.url?.trim()) return { isValid: false, error: 'La imagen no tiene una URL válida' };
    if (!imageData.name?.trim()) return { isValid: false, error: 'La imagen no tiene un nombre válido' };

    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const timeout = setTimeout(() => resolve({ isValid: false, error: 'Timeout cargando la imagen' }), 10000);
      img.onload = () => {
        clearTimeout(timeout);
        if (img.width === 0 || img.height === 0) { resolve({ isValid: false, error: 'La imagen tiene dimensiones inválidas' }); return; }
        if (img.width > 10000 || img.height > 10000) { resolve({ isValid: false, error: 'La imagen es demasiado grande' }); return; }
        resolve({ isValid: true });
      };
      img.onerror = () => { clearTimeout(timeout); resolve({ isValid: false, error: 'No se pudo cargar la imagen' }); };
      img.src = imageData.url;
    });
  }
}
