// Configuraciones predefinidas para proveedores SMTP comunes
export const SMTP_PRESETS = {
  posteio: {
    host: 'mail.koko.toys',
    port: 587,
    secure: false,
    name: 'Poste.io (Koko.toys)',
    description: 'Poste.io SMTP Server - Dominio personalizado',
    instructions: 'Servidor de correo Poste.io con dominio personalizado. Usa tu email y contraseña de Poste.io.'
  },
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    name: 'Gmail',
    description: 'Gmail SMTP (requiere contraseña de aplicación)',
    instructions: 'Para Gmail, necesitas generar una contraseña de aplicación en tu cuenta de Google.'
  },
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    name: 'Outlook/Hotmail',
    description: 'Microsoft Outlook SMTP',
    instructions: 'Usa tu email y contraseña de Microsoft.'
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    name: 'Yahoo Mail',
    description: 'Yahoo Mail SMTP',
    instructions: 'Para Yahoo, necesitas generar una contraseña de aplicación.'
  },
  custom: {
    host: '',
    port: 587,
    secure: false,
    name: 'Personalizado',
    description: 'Configuración SMTP personalizada',
    instructions: 'Configura tu propio servidor SMTP.'
  }
};

// Mensajes de error comunes de SMTP
export const SMTP_ERROR_MESSAGES = {
  'EAUTH': 'Error de autenticación. Verifica tu usuario y contraseña.',
  'ECONNECTION': 'Error de conexión. Verifica el host y puerto.',
  'ETIMEDOUT': 'Tiempo de espera agotado. Verifica tu conexión a internet.',
  'ENOTFOUND': 'Servidor no encontrado. Verifica el host SMTP.',
  'ECONNREFUSED': 'Conexión rechazada. El servidor puede estar inactivo.',
  'EINVALID': 'Configuración inválida. Verifica todos los campos.',
  'DEFAULT': 'Error desconocido. Verifica tu configuración SMTP.'
};

// Función para obtener un mensaje de error amigable
export function getFriendlyErrorMessage(error: any): string {
  if (!error) return SMTP_ERROR_MESSAGES.DEFAULT;
  
  const errorCode = error.code || error.errno || '';
  const errorMessage = error.message || '';
  
  // Buscar código de error específico
  for (const [code, message] of Object.entries(SMTP_ERROR_MESSAGES)) {
    if (errorCode.includes(code) || errorMessage.includes(code)) {
      return message;
    }
  }
  
  // Buscar patrones comunes en el mensaje
  if (errorMessage.toLowerCase().includes('authentication')) {
    return SMTP_ERROR_MESSAGES.EAUTH;
  }
  if (errorMessage.toLowerCase().includes('connection')) {
    return SMTP_ERROR_MESSAGES.ECONNECTION;
  }
  if (errorMessage.toLowerCase().includes('timeout')) {
    return SMTP_ERROR_MESSAGES.ETIMEDOUT;
  }
  if (errorMessage.toLowerCase().includes('not found')) {
    return SMTP_ERROR_MESSAGES.ENOTFOUND;
  }
  
  return SMTP_ERROR_MESSAGES.DEFAULT;
}

// Función para validar configuración SMTP
export function validateSMTPConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.host || config.host.trim() === '') {
    errors.push('El host SMTP es requerido');
  }
  
  if (!config.port || config.port < 1 || config.port > 65535) {
    errors.push('El puerto debe ser un número válido entre 1 y 65535');
  }
  
  if (!config.username || config.username.trim() === '') {
    errors.push('El nombre de usuario es requerido');
  }
  
  if (!config.password || config.password.trim() === '') {
    errors.push('La contraseña es requerida');
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
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Función para aplicar configuración predefinida
export function applySMTPPreset(presetName: keyof typeof SMTP_PRESETS) {
  const preset = SMTP_PRESETS[presetName];
  
  // Configuración específica para Poste.io (Koko.toys)
  if (presetName === 'posteio') {
    return {
      host: preset.host,
      port: preset.port,
      secure: preset.secure,
      username: 'admin@koko.toys',
      password: '',
      fromEmail: 'admin@koko.toys',
      fromName: 'Koko.toys Admin',
      enabled: true
    };
  }
  
  // Configuración por defecto para otros presets
  return {
    host: preset.host,
    port: preset.port,
    secure: preset.secure,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    enabled: true
  };
}
