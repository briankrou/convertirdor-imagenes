// Servicio de Gmail API compatible con navegador

export interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export interface PasswordRecoveryEmail {
  to: string;
  username: string;
  newPassword: string;
  resetLink?: string;
}

export interface GmailApiConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
}

/**
 * Servicio de email usando Gmail API (compatible con navegador)
 * Más moderno, seguro y confiable que SMTP
 */
class GmailApiService {
  private config: GmailApiConfig | null = null;

  /**
   * Configura las credenciales de la Gmail API
   */
  setGmailConfig(config: GmailApiConfig): void {
    this.config = config;
    this.initializeConfig();
  }

  /**
   * Obtiene la configuración actual
   */
  getGmailConfig(): GmailApiConfig | null {
    return this.config;
  }

  /**
   * Inicializa la configuración (compatible con navegador)
   */
  private initializeConfig(): void {
    // En el navegador, solo validamos la configuración
    if (!this.config) return;
    
    // Validar configuración básica
    if (!this.config.clientId || !this.config.clientSecret) {
      console.warn('Gmail API: Client ID o Client Secret no configurados');
    }
  }

  /**
   * Verifica si el servicio está configurado
   */
  isConfigured(): boolean {
    return !!(
      this.config &&
      this.config.enabled &&
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.fromEmail &&
      this.config.fromName
    );
  }

  /**
   * Genera la URL de autorización OAuth2
   */
  getAuthUrl(): string {
    if (!this.config) {
      throw new Error('Configuración Gmail API no inicializada');
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose'
    ];

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Intercambia el código de autorización por tokens
   */
  async getTokensFromCode(code: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!this.config) {
      throw new Error('Configuración Gmail API no inicializada');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error al obtener tokens: ${error}`);
      }

      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token
      };
    } catch (error) {
      throw new Error(`Error al obtener tokens: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Prueba la conexión con Gmail API
   */
  async testConnection(): Promise<EmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Gmail API no configurada o deshabilitada'
      };
    }

    try {
      // Verificar que tenemos tokens válidos
      if (!this.config?.accessToken) {
        return {
          success: false,
          error: 'No hay token de acceso. Necesitas autorizar la aplicación.'
        };
      }

      // Probar obteniendo el perfil del usuario usando fetch
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const profile = await response.json();
      console.log('Conexión Gmail API exitosa:', profile);

      return {
        success: true,
        messageId: 'gmail-api-test-' + Date.now()
      };
    } catch (error) {
      console.error('Error al probar conexión Gmail API:', error);
      return {
        success: false,
        error: this.getFriendlyErrorMessage(error)
      };
    }
  }

  /**
   * Envía un email de recuperación de contraseña
   */
  async sendPasswordRecoveryEmail(emailData: PasswordRecoveryEmail): Promise<EmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Gmail API no configurada o deshabilitada'
      };
    }

    try {
      if (!this.config?.accessToken) {
        return {
          success: false,
          error: 'No hay token de acceso. Necesitas autorizar la aplicación.'
        };
      }

      const emailContent = this.generatePasswordRecoveryEmail(emailData);
      
      // Crear el mensaje en formato RFC 2822
      const message = this.createEmailMessage(emailData.to, emailContent);
      
      // Enviar el email usando fetch
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: message
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const result = await response.json();

      console.log('Email enviado via Gmail API:', {
        to: emailData.to,
        subject: emailContent.subject,
        messageId: result.id
      });

      return {
        success: true,
        messageId: result.id || 'gmail-' + Date.now()
      };
    } catch (error) {
      console.error('Error al enviar email via Gmail API:', error);
      return {
        success: false,
        error: this.getFriendlyErrorMessage(error)
      };
    }
  }

  /**
   * Crea el mensaje de email en formato RFC 2822
   */
  private createEmailMessage(to: string, emailContent: any): string {
    const boundary = 'boundary_' + Date.now();
    
    const message = [
      `From: "${this.config!.fromName}" <${this.config!.fromEmail}>`,
      `To: ${to}`,
      `Subject: ${emailContent.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      '',
      emailContent.text,
      '',
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      '',
      emailContent.html,
      '',
      `--${boundary}--`
    ].join('\n');

    // Codificar en base64url
    return Buffer.from(message).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Genera el contenido del email de recuperación de contraseña
   */
  private generatePasswordRecoveryEmail(emailData: PasswordRecoveryEmail) {
    const { username, newPassword, resetLink } = emailData;
    
    const subject = 'Recuperación de contraseña - Sistema de Conversión de Imágenes';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de contraseña</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #3b82f6;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f8fafc;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e2e8f0;
          }
          .password-box {
            background-color: #1e293b;
            color: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 18px;
            text-align: center;
            margin: 20px 0;
            letter-spacing: 2px;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Recuperación de Contraseña</h1>
          <p>Sistema de Conversión de Imágenes</p>
        </div>
        
        <div class="content">
          <h2>Hola ${username},</h2>
          
          <p>Hemos recibido una solicitud para recuperar tu contraseña. A continuación encontrarás tu nueva contraseña temporal:</p>
          
          <div class="password-box">
            ${newPassword}
          </div>
          
          <p><strong>Instrucciones importantes:</strong></p>
          <ul>
            <li>Utiliza esta contraseña para iniciar sesión en el sistema</li>
            <li>Te recomendamos cambiar esta contraseña por una personal después del primer acceso</li>
            <li>Esta contraseña es temporal y segura</li>
          </ul>
          
          ${resetLink ? `
            <p>También puedes hacer clic en el siguiente enlace para restablecer tu contraseña:</p>
            <a href="${resetLink}" class="button">Restablecer Contraseña</a>
          ` : ''}
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Si no solicitaste este cambio de contraseña, por favor contacta al administrador del sistema inmediatamente.
          </div>
          
          <p>Si tienes problemas para acceder, no dudes en contactar al soporte técnico.</p>
          
          <p>Saludos,<br>
          <strong>Equipo de Soporte</strong></p>
        </div>
        
        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          <p>© ${new Date().getFullYear()} Sistema de Conversión de Imágenes</p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Recuperación de Contraseña - Sistema de Conversión de Imágenes
      
      Hola ${username},
      
      Hemos recibido una solicitud para recuperar tu contraseña. 
      Tu nueva contraseña temporal es: ${newPassword}
      
      Instrucciones importantes:
      - Utiliza esta contraseña para iniciar sesión en el sistema
      - Te recomendamos cambiar esta contraseña por una personal después del primer acceso
      - Esta contraseña es temporal y segura
      
      ${resetLink ? `También puedes usar este enlace para restablecer tu contraseña: ${resetLink}` : ''}
      
      IMPORTANTE: Si no solicitaste este cambio de contraseña, por favor contacta al administrador del sistema inmediatamente.
      
      Si tienes problemas para acceder, no dudes en contactar al soporte técnico.
      
      Saludos,
      Equipo de Soporte
      
      ---
      Este es un email automático, por favor no respondas a este mensaje.
      © ${new Date().getFullYear()} Sistema de Conversión de Imágenes
    `;

    return {
      subject,
      html: htmlContent,
      text: textContent
    };
  }

  /**
   * Genera una contraseña temporal segura
   */
  generateTemporaryPassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  /**
   * Valida una dirección de email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Obtiene un mensaje de error amigable
   */
  private getFriendlyErrorMessage(error: any): string {
    if (!error) return 'Error desconocido';
    
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('invalid_grant')) {
      return 'Token de acceso expirado. Necesitas reautorizar la aplicación.';
    }
    
    if (errorMessage.includes('insufficient_scope')) {
      return 'Permisos insuficientes. Verifica la configuración de la API.';
    }
    
    if (errorMessage.includes('quota')) {
      return 'Cuota de Gmail API excedida. Intenta más tarde.';
    }
    
    if (errorMessage.includes('unauthorized')) {
      return 'No autorizado. Verifica las credenciales de la API.';
    }
    
    if (errorMessage.includes('not found')) {
      return 'Recurso no encontrado. Verifica la configuración.';
    }
    
    return `Error de Gmail API: ${errorMessage}`;
  }
}

// Instancia singleton del servicio
export const gmailApiService = new GmailApiService();
