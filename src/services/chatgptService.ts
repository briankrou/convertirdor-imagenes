import { ChatGPTSettings, ImageData, PromptSettings } from '../types';

export interface ChatGPTResponse {
  title: string;
  description: string;
  caption: string;
  altText: string;
}

export class ChatGPTService {
  private settings: ChatGPTSettings;

  constructor(settings: ChatGPTSettings) {
    this.settings = settings;
  }

  async generateImageDescription(imageData: ImageData, productDescription?: string, namePrefix?: string, promptSettings?: PromptSettings): Promise<ChatGPTResponse> {
    if (!this.settings.enabled || !this.settings.apiKey) {
      throw new Error('ChatGPT no está configurado o habilitado');
    }

    try {
      // Convertir la imagen a base64 para enviarla a la API
      const base64Image = await this.convertImageToBase64(imageData.url);
      
      // Usar prompts personalizados o predeterminados
      const prompts = promptSettings?.useCustomPrompts ? promptSettings : {
        titlePrompt: "Genera un título atractivo y descriptivo para esta imagen (máximo 60 caracteres). El título debe ser claro, conciso y que capture la esencia del producto mostrado.",
        descriptionPrompt: "Describe detalladamente lo que ves en esta imagen. Incluye características visuales, colores, materiales, estilo y cualquier detalle relevante del producto (2-3 oraciones).",
        captionPrompt: "Crea una leyenda corta y atractiva para esta imagen que resalte las características principales del producto (1 oración).",
        altTextPrompt: "Genera un texto alternativo descriptivo para accesibilidad que describa claramente el contenido de la imagen (máximo 125 caracteres)."
      };

      let prompt = `Analiza esta imagen específica y proporciona:
1. TÍTULO: ${prompts.titlePrompt}
2. DESCRIPCIÓN: ${prompts.descriptionPrompt}
3. LEYENDA: ${prompts.captionPrompt}
4. TEXTO ALTERNATIVO: ${prompts.altTextPrompt}

Responde en formato JSON con las claves: "title", "description", "caption", "altText"`;

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
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error de API: ${errorData.error?.message || 'Error desconocido'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No se recibió respuesta de ChatGPT');
      }

      // Intentar parsear el JSON de la respuesta
      try {
        const parsedResponse = JSON.parse(content);
        return {
          title: parsedResponse.title || 'Título no disponible',
          description: parsedResponse.description || 'Descripción no disponible',
          caption: parsedResponse.caption || 'Leyenda no disponible',
          altText: parsedResponse.altText || 'Texto alternativo no disponible'
        };
      } catch (parseError) {
        // Si no es JSON válido, extraer información del texto
        return this.parseTextResponse(content);
      }

    } catch (error) {
      console.error('Error generando descripción:', error);
      throw error;
    }
  }

  private async convertImageToBase64(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        try {
          const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          resolve(base64);
        } catch (error) {
          reject(new Error('Error convirtiendo imagen a base64'));
        }
      };
      
      img.onerror = () => {
        reject(new Error('Error cargando imagen'));
      };
      
      img.src = imageUrl;
    });
  }

  private parseTextResponse(text: string): ChatGPTResponse {
    // Extraer información del texto si no es JSON válido
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      title: lines[0] || 'Título no disponible',
      description: lines[1] || 'Descripción no disponible',
      caption: lines[2] || 'Leyenda no disponible',
      altText: lines[3] || 'Texto alternativo no disponible'
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
}
