import { ChatGPTSettings, ImageData, PromptSettings, UsageRecord, UserChatGPTSettings, UserPromptSettings } from '../types';
import { authService } from './authService';

export interface ChatGPTResponse {
  title: string;
  description: string;
  caption: string;
  altText: string;
}

export class ChatGPTService {
  private settings: UserChatGPTSettings;

  // Precios por token para cada modelo (en USD)
  private static readonly MODEL_PRICING = {
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4.1': { input: 0.01, output: 0.03 },
    'o3': { input: 0.05, output: 0.15 }
  };

  constructor(settings: UserChatGPTSettings) {
    this.settings = settings;
  }

  private calculateCost(promptTokens: number, completionTokens: number, model: string): number {
    const pricing = ChatGPTService.MODEL_PRICING[model as keyof typeof ChatGPTService.MODEL_PRICING];
    if (!pricing) {
      console.warn(`Pricing not found for model: ${model}`);
      return 0;
    }
    
    const inputCost = (promptTokens / 1000) * pricing.input;
    const outputCost = (completionTokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  private saveUsageRecord(record: UsageRecord): void {
    try {
      // Guardar en el historial normal
      const existing = localStorage.getItem('chatgpt-usage-history');
      const records: UsageRecord[] = existing ? JSON.parse(existing) : [];
      records.push(record);
      localStorage.setItem('chatgpt-usage-history', JSON.stringify(records));
      
      // También guardar en el respaldo de administradores
      const adminBackup = localStorage.getItem('chatgpt-usage-history-admin-backup');
      const adminRecords: UsageRecord[] = adminBackup ? JSON.parse(adminBackup) : [];
      adminRecords.push(record);
      localStorage.setItem('chatgpt-usage-history-admin-backup', JSON.stringify(adminRecords));
    } catch (error) {
      console.error('Error saving usage record:', error);
    }
  }

  async generateImageDescription(imageData: ImageData, productDescription?: string, namePrefix?: string, promptSettings?: UserPromptSettings): Promise<ChatGPTResponse> {
    console.log('🔍 Iniciando generación de descripción para:', imageData.name);
    console.log('🔧 Configuración ChatGPT:', {
      enabled: this.settings.enabled,
      hasApiKey: !!this.settings.apiKey,
      model: this.settings.model
    });

    if (!this.settings.enabled || !this.settings.apiKey) {
      throw new Error('ChatGPT no está configurado o habilitado');
    }

    try {
      // Validar la imagen antes de procesarla
      console.log('🔍 Validando imagen:', imageData.name);
      const validation = await this.validateImage(imageData);
      
      if (!validation.isValid) {
        throw new Error(validation.error || 'La imagen no es válida');
      }
      
      console.log('✅ Imagen validada exitosamente');
      console.log('🖼️ Convirtiendo imagen a base64...');
      console.log('📁 Datos de imagen:', {
        name: imageData.name,
        url: imageData.url,
        urlLength: imageData.url.length
      });
      
      const base64Image = await this.convertImageToBase64(imageData.url);
      console.log('✅ Imagen convertida a base64, tamaño:', base64Image.length, 'caracteres');
      
      // Usar prompts personalizados o predeterminados
      const prompts = promptSettings?.useCustomPrompts ? promptSettings : {
        titlePrompt: "Genera un título atractivo y descriptivo para esta imagen (máximo 60 caracteres). El título debe ser claro, conciso y que capture la esencia del producto mostrado.",
        descriptionPrompt: "Describe detalladamente lo que ves en esta imagen. Incluye características visuales, colores, materiales, estilo y cualquier detalle relevante del producto (2-3 oraciones).",
        captionPrompt: "Crea una leyenda corta y atractiva para esta imagen que resalte las características principales del producto (1 oración).",
        altTextPrompt: "Genera un texto alternativo descriptivo para accesibilidad que describa claramente el contenido de la imagen (máximo 125 caracteres)."
      };

      let prompt = `Analiza esta imagen específica y proporciona la descripción en el siguiente formato exacto:

================================================================================
*Texto alternativo*: [${prompts.altTextPrompt}]
*Título*: [${prompts.titlePrompt}]
*Leyenda*: [${prompts.captionPrompt}]
*Descripción*: [${prompts.descriptionPrompt}]
================================================================================

IMPORTANTE: Responde ÚNICAMENTE con el formato mostrado arriba, reemplazando los corchetes con el contenido generado. NO uses formato JSON, NO agregues texto adicional, NO uses comillas.`;

      // Agregar contexto del producto como información adicional (no como parte del prompt)
      if (productDescription && productDescription.trim()) {
        prompt += `\n\nCONTEXTO ADICIONAL DEL PRODUCTO: ${productDescription}`;
      }

      if (namePrefix && namePrefix.trim()) {
        prompt += `\n\nPREFIJO DEL PRODUCTO: ${namePrefix}`;
      }

      if ((productDescription && productDescription.trim()) || (namePrefix && namePrefix.trim())) {
        prompt += `\n\nUsa esta información de contexto para generar contenido más preciso, pero enfócate en describir específicamente lo que ves en esta imagen particular.`;
      }

      console.log('🚀 Enviando solicitud a OpenAI API...');
      console.log('📋 Configuración de la solicitud:', {
        model: this.settings.model,
        promptLength: prompt.length,
        imageSize: base64Image.length,
        hasApiKey: !!this.settings.apiKey
      });
      
      const requestBody = {
        model: this.settings.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      };
      
      console.log('📤 Cuerpo de la solicitud:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Respuesta recibida, status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('❌ Error parseando respuesta de error:', parseError);
          errorData = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
        }
        
        console.error('❌ Error de API:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });
        
        // Proporcionar mensajes de error más específicos
        let errorMessage = 'Error desconocido';
        if (response.status === 401) {
          errorMessage = 'API key inválida o expirada';
        } else if (response.status === 429) {
          errorMessage = 'Límite de solicitudes excedido. Intenta más tarde';
        } else if (response.status === 400) {
          errorMessage = errorData.error?.message || 'Solicitud inválida';
        } else if (response.status === 413) {
          errorMessage = 'La imagen es demasiado grande';
        } else if (response.status === 500) {
          errorMessage = 'Error interno del servidor de OpenAI';
        } else {
          errorMessage = errorData.error?.message || `Error HTTP ${response.status}`;
        }
        
        throw new Error(`Error de API: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('✅ Datos recibidos de OpenAI:', data);
      const content = data.choices[0]?.message?.content;
      console.log('📝 Contenido de la respuesta:', content);

      if (!content) {
        throw new Error('No se recibió respuesta de ChatGPT');
      }

            // Extraer información de uso de la respuesta
            const usage = data.usage;
            const promptTokens = usage?.prompt_tokens || 0;
            const completionTokens = usage?.completion_tokens || 0;
            const totalTokens = usage?.total_tokens || (promptTokens + completionTokens);
            const cost = this.calculateCost(promptTokens, completionTokens, this.settings.model);

            // Guardar registro de uso
            const currentUser = authService.getCurrentUser();
            const usageRecord: UsageRecord = {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              model: this.settings.model,
              imageName: `${currentUser?.username || 'unknown'}_${imageData.name}`,
              promptTokens,
              completionTokens,
              totalTokens,
              cost,
              success: true
            };
            this.saveUsageRecord(usageRecord);

            // Intentar parsear el JSON de la respuesta
            try {
              console.log('🔍 Intentando parsear como JSON...');
              const parsedResponse = JSON.parse(content);
              console.log('✅ Parseado como JSON exitosamente:', parsedResponse);
              return {
                title: parsedResponse.title || 'Título no disponible',
                description: parsedResponse.description || 'Descripción no disponible',
                caption: parsedResponse.caption || 'Leyenda no disponible',
                altText: parsedResponse.altText || 'Texto alternativo no disponible'
              };
            } catch (parseError) {
              console.log('⚠️ No es JSON válido, parseando como texto...');
              // Si no es JSON válido, extraer información del texto
              const result = this.parseTextResponse(content);
              console.log('✅ Parseado como texto:', result);
              return result;
            }

    } catch (error) {
      console.error('❌ Error generando descripción:', error);
      
      // Determinar el tipo de error y proporcionar un mensaje más específico
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        if (error.message.includes('Error cargando imagen')) {
          errorMessage = `No se pudo cargar la imagen: ${imageData.name}`;
        } else if (error.message.includes('Error convirtiendo imagen')) {
          errorMessage = `No se pudo procesar la imagen: ${imageData.name}`;
        } else if (error.message.includes('Timeout')) {
          errorMessage = `Timeout procesando la imagen: ${imageData.name}`;
        } else if (error.message.includes('Error de API')) {
          errorMessage = `Error de ChatGPT API: ${error.message}`;
        } else if (error.message.includes('No se recibió respuesta')) {
          errorMessage = `ChatGPT no respondió para: ${imageData.name}`;
        } else {
          errorMessage = `Error analizando imagen: ${error.message}`;
        }
      }
      
      console.error('📝 Mensaje de error específico:', errorMessage);
      
      // Guardar registro de error
      const currentUser = authService.getCurrentUser();
      const errorRecord: UsageRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        model: this.settings.model,
        imageName: `${currentUser?.username || 'unknown'}_${imageData.name}`,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        success: false,
        error: errorMessage
      };
      this.saveUsageRecord(errorRecord);
      
      // Lanzar un error más descriptivo
      throw new Error(errorMessage);
    }
  }

  private async convertImageToBase64(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('🖼️ Iniciando conversión de imagen:', imageUrl);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('✅ Imagen cargada exitosamente:', {
          width: img.width,
          height: img.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        try {
          ctx.drawImage(img, 0, 0);
          console.log('✅ Imagen dibujada en canvas');
          
          // Intentar diferentes formatos y calidades
          let base64: string;
          try {
            base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            console.log('✅ Imagen convertida a JPEG, tamaño:', base64.length);
          } catch (jpegError) {
            console.warn('⚠️ Error con JPEG, intentando PNG:', jpegError);
            base64 = canvas.toDataURL('image/png').split(',')[1];
            console.log('✅ Imagen convertida a PNG, tamaño:', base64.length);
          }
          
          // Verificar que la imagen no esté vacía
          if (!base64 || base64.length < 100) {
            reject(new Error('La imagen convertida está vacía o es muy pequeña'));
            return;
          }
          
          resolve(base64);
        } catch (error) {
          console.error('❌ Error en la conversión:', error);
          reject(new Error(`Error convirtiendo imagen a base64: ${error instanceof Error ? error.message : 'Error desconocido'}`));
        }
      };
      
      img.onerror = (error) => {
        console.error('❌ Error cargando imagen:', error);
        reject(new Error(`Error cargando imagen: ${imageUrl}`));
      };
      
      // Timeout para evitar que se cuelgue
      setTimeout(() => {
        reject(new Error('Timeout cargando imagen'));
      }, 30000); // 30 segundos
      
      img.src = imageUrl;
    });
  }

  private parseTextResponse(text: string): ChatGPTResponse {
    // Extraer información del texto con el nuevo formato
    const lines = text.split('\n').filter(line => line.trim());
    
    let title = 'Título no disponible';
    let description = 'Descripción no disponible';
    let caption = 'Leyenda no disponible';
    let altText = 'Texto alternativo no disponible';
    
    // Buscar cada campo por su patrón
    for (const line of lines) {
      if (line.includes('*Texto alternativo*:')) {
        altText = line.replace('*Texto alternativo*:', '').trim();
      } else if (line.includes('*Título*:')) {
        title = line.replace('*Título*:', '').trim();
      } else if (line.includes('*Leyenda*:')) {
        caption = line.replace('*Leyenda*:', '').trim();
      } else if (line.includes('*Descripción*:')) {
        description = line.replace('*Descripción*:', '').trim();
      }
    }
    
    return {
      title,
      description,
      caption,
      altText
    };
  }

  async testConnection(): Promise<boolean> {
    if (!this.settings.apiKey) {
      return false;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.settings.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error probando conexión:', error);
      return false;
    }
  }

  async testImageAnalysis(imageData: ImageData): Promise<{ success: boolean; error?: string; details?: any }> {
    if (!this.settings.enabled || !this.settings.apiKey) {
      return { success: false, error: 'ChatGPT no está configurado' };
    }

    try {
      console.log('🧪 Iniciando prueba de análisis de imagen:', imageData.name);
      
      // Validar la imagen primero
      const validation = await this.validateImage(imageData);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }
      
      const base64Image = await this.convertImageToBase64(imageData.url);
      console.log('✅ Imagen convertida para prueba, tamaño:', base64Image.length);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Describe brevemente lo que ves en esta imagen.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${errorData.error?.message || response.statusText}`,
          details: { status: response.status, errorData }
        };
      }

      const data = await response.json();
      console.log('✅ Prueba de análisis exitosa:', data);
      
      return { 
        success: true, 
        details: { 
          content: data.choices[0]?.message?.content,
          usage: data.usage 
        } 
      };
    } catch (error) {
      console.error('❌ Error probando análisis de imagen:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: { originalError: error }
      };
    }
  }

  async validateImage(imageData: ImageData): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Validar datos básicos
      if (!imageData.url || imageData.url.trim() === '') {
        return { isValid: false, error: 'La imagen no tiene una URL válida' };
      }
      
      if (!imageData.name || imageData.name.trim() === '') {
        return { isValid: false, error: 'La imagen no tiene un nombre válido' };
      }

      // Intentar cargar la imagen
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ isValid: false, error: 'Timeout cargando la imagen' });
        }, 10000); // 10 segundos

        img.onload = () => {
          clearTimeout(timeout);
          
          // Verificar dimensiones
          if (img.width === 0 || img.height === 0) {
            resolve({ isValid: false, error: 'La imagen tiene dimensiones inválidas' });
            return;
          }
          
          // Verificar que no sea demasiado grande
          if (img.width > 10000 || img.height > 10000) {
            resolve({ isValid: false, error: 'La imagen es demasiado grande' });
            return;
          }
          
          resolve({ isValid: true });
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          resolve({ isValid: false, error: 'No se pudo cargar la imagen' });
        };
        
        img.src = imageData.url;
      });
    } catch (error) {
      return { 
        isValid: false, 
        error: `Error validando imagen: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }
}
