/**
 * Utilidades para manejar la autorización OAuth2 de Gmail API
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Maneja el callback de autorización OAuth2
 */
export function handleGmailAuthCallback(): void {
  // Obtener parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    // Enviar error a la ventana padre
    if (window.opener) {
      window.opener.postMessage({
        type: 'GMAIL_AUTH_ERROR',
        error: error
      }, window.location.origin);
    }
    return;
  }

  if (code) {
    // Enviar código de autorización a la ventana padre
    if (window.opener) {
      window.opener.postMessage({
        type: 'GMAIL_AUTH_CODE',
        code: code
      }, window.location.origin);
    }
  }
}

/**
 * Crea una URL de callback para OAuth2
 */
export function createCallbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}

/**
 * Valida si estamos en una ventana de autorización
 */
export function isAuthWindow(): boolean {
  return window.location.pathname === '/auth/callback';
}

/**
 * Cierra la ventana de autorización
 */
export function closeAuthWindow(): void {
  if (window.opener) {
    window.close();
  }
}

/**
 * Configuración por defecto para Gmail API
 */
export const DEFAULT_GMAIL_CONFIG = {
  clientId: '',
  clientSecret: '',
  redirectUri: createCallbackUrl(),
  fromEmail: 'admin@koko.toys',
  fromName: 'Koko.toys Admin',
  enabled: true
};

/**
 * Scopes requeridos para Gmail API
 */
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose'
];

/**
 * Valida la configuración de Gmail API
 */
export function validateGmailConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.clientId || config.clientId.trim() === '') {
    errors.push('El Client ID es requerido');
  }
  
  if (!config.clientSecret || config.clientSecret.trim() === '') {
    errors.push('El Client Secret es requerido');
  }
  
  if (!config.redirectUri || config.redirectUri.trim() === '') {
    errors.push('El Redirect URI es requerido');
  }
  
  if (!config.fromEmail || config.fromEmail.trim() === '') {
    errors.push('El email del remitente es requerido');
  }
  
  if (!config.fromName || config.fromName.trim() === '') {
    errors.push('El nombre del remitente es requerido');
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (config.fromEmail && !emailRegex.test(config.fromEmail)) {
    errors.push('El email del remitente no tiene un formato válido');
  }
  
  // Validar formato de Client ID
  if (config.clientId && !config.clientId.includes('.apps.googleusercontent.com')) {
    errors.push('El Client ID no tiene el formato correcto de Google');
  }
  
  // Validar formato de Client Secret
  if (config.clientSecret && !config.clientSecret.startsWith('GOCSPX-')) {
    errors.push('El Client Secret no tiene el formato correcto de Google');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Genera una URL de autorización OAuth2
 */
export function generateAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Maneja el intercambio de código por tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<AuthTokens> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
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
}

/**
 * Refresca un token de acceso
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al refrescar token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}
