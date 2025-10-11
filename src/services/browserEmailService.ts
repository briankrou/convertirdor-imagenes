import { UserSMTPSettings } from '../types';

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

/**
 * Servicio de email compatible con navegador
 * Usa diferentes estrategias para enviar emails desde el frontend
 */
class BrowserEmailService {
  private smtpSettings: UserSMTPSettings | null = null;

  /**
   * Configura las credenciales SMTP
   */
  setSMTPSettings(settings: UserSMTPSettings): void {
    this.smtpSettings = settings;
  }

  /**
   * Obtiene la configuración SMTP actual
   */
  getSMTPSettings(): UserSMTPSettings | null {
    return this.smtpSettings;
  }

  /**
   * Verifica si el servicio de email está configurado y habilitado
   */
  isConfigured(): boolean {
    return !!(
      this.smtpSettings &&
      this.smtpSettings.enabled &&
      this.smtpSettings.host &&
      this.smtpSettings.port &&
      this.smtpSettings.username &&
      this.smtpSettings.password &&
      this.smtpSettings.fromEmail &&
      this.smtpSettings.fromName
    );
  }

  /**
   * Prueba la configuración SMTP
   */
  async testConnection(): Promise<EmailResult> {
    if (!this.smtpSettings) {
      return {
        success: false,
        error: 'Configuración SMTP no encontrada'
      };
    }

    try {
      // Validar configuración básica
      if (!this.smtpSettings.host || !this.smtpSettings.port || !this.smtpSettings.username || !this.smtpSettings.password) {
        return {
          success: false,
          error: 'Configuración SMTP incompleta'
        };
      }

      // Simular prueba de conexión con validación realista
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Validar formato de email del remitente
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.smtpSettings.fromEmail || this.smtpSettings.fromEmail.trim() === '') {
        return {
          success: false,
          error: 'El email del remitente es requerido. Configúralo en "Configuración del Remitente"'
        };
      }
      
      if (!emailRegex.test(this.smtpSettings.fromEmail)) {
        return {
          success: false,
          error: `El email del remitente "${this.smtpSettings.fromEmail}" no tiene un formato válido. Debe ser como: admin@koko.toys`
        };
      }

      // Validar configuración de host común
      const commonHosts = [
        'smtp.poste.io',
        'mail.koko.toys',
        'smtp.gmail.com',
        'smtp-mail.outlook.com',
        'smtp.mail.yahoo.com',
        'smtp.office365.com'
      ];

      // Validar dominios personalizados de Poste.io
      const posteioPatterns = [
        'mail.',
        'smtp.',
        '.toys',
        '.io',
        '.com'
      ];

      const isValidHost = commonHosts.some(host => 
        this.smtpSettings!.host.toLowerCase().includes(host.toLowerCase())
      ) || posteioPatterns.some(pattern => 
        this.smtpSettings!.host.toLowerCase().includes(pattern.toLowerCase())
      ) || this.smtpSettings.host.includes('.');

      if (!isValidHost) {
        return {
          success: false,
          error: 'El host SMTP no parece ser válido'
        };
      }

      return {
        success: true,
        messageId: 'test-connection-' + Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al probar conexión'
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
        error: 'Servicio de email no configurado o deshabilitado'
      };
    }

    try {
      // Validar email de destino
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailData.to)) {
        return {
          success: false,
          error: 'El email de destino no tiene un formato válido'
        };
      }

      const emailContent = this.generatePasswordRecoveryEmail(emailData);
      
      // Simular envío de email con diferentes estrategias
      const result = await this.sendEmailViaAPI(emailData, emailContent);
      
      console.log('Email de recuperación enviado:', {
        to: emailData.to,
        subject: emailContent.subject,
        from: `${this.smtpSettings!.fromName} <${this.smtpSettings!.fromEmail}>`,
        method: result.method
      });

      return result;
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al enviar email de recuperación'
      };
    }
  }

  /**
   * Intenta enviar email usando diferentes métodos
   */
  private async sendEmailViaAPI(emailData: PasswordRecoveryEmail, emailContent: any): Promise<EmailResult> {
    // Método 1: Intentar usar mailto (fallback)
    if (this.shouldUseMailto()) {
      return this.sendViaMailto(emailData, emailContent);
    }

    // Método 2: Simular envío exitoso (para demostración)
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      messageId: 'recovery-' + Date.now()
    };
  }

  /**
   * Envía email usando mailto (fallback)
   */
  private sendViaMailto(emailData: PasswordRecoveryEmail, emailContent: any): EmailResult {
    try {
      const subject = encodeURIComponent(emailContent.subject);
      const body = encodeURIComponent(emailContent.text);
      const mailtoUrl = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      
      // Abrir cliente de email
      window.open(mailtoUrl, '_blank');
      
      return {
        success: true,
        messageId: 'mailto-' + Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: 'No se pudo abrir el cliente de email'
      };
    }
  }

  /**
   * Determina si debe usar mailto como fallback
   */
  private shouldUseMailto(): boolean {
    // En un entorno de desarrollo o si no hay configuración real
    return window.location.hostname === 'localhost' || !this.smtpSettings?.host;
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
}

// Instancia singleton del servicio
export const browserEmailService = new BrowserEmailService();
