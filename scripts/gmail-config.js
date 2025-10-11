#!/usr/bin/env node

/**
 * Script de configuración para Gmail API
 * Maneja las URLs de redirect según el entorno
 */

require('dotenv').config();

// Función para validar URL de redirect según requisitos de Google
function validateRedirectUri(uri) {
  const errors = [];
  
  try {
    const url = new URL(uri);
    
    // Debe tener protocolo
    if (!url.protocol) {
      errors.push('Debe tener un protocolo (http:// o https://)');
    }
    
    // No puede contener fragmentos de URL
    if (url.hash) {
      errors.push('No puede contener fragmentos de URL (#)');
    }
    
    // No puede ser una dirección IP pública
    if (url.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      errors.push('No puede ser una dirección IP pública');
    }
    
    // No puede contener comodines
    if (uri.includes('*')) {
      errors.push('No puede contener comodines (*)');
    }
    
    // Para producción, debe usar HTTPS
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      errors.push('Para producción debe usar HTTPS');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['URL no válida']
    };
  }
}

// Configuración de Gmail API según el entorno
function getGmailConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isEasyPanel = process.env.EASYPANEL === 'true' || process.env.PORT;
  
  // URLs de redirect según el entorno
  const redirectUris = {
    development: process.env.GMAIL_REDIRECT_URI_DEV || 'http://localhost:3000/auth/callback',
    production: process.env.GMAIL_REDIRECT_URI_PROD || 'https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback',
    default: process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/auth/callback'
  };
  
  // Determinar el entorno
  let environment = 'development';
  let redirectUri = redirectUris.development;
  
  if (isProduction || isEasyPanel) {
    environment = 'production';
    redirectUri = redirectUris.production;
  }
  
  // Validar URL de redirect
  const validation = validateRedirectUri(redirectUri);
  
  const config = {
    environment,
    clientId: process.env.GMAIL_CLIENT_ID || '',
    clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
    redirectUri,
    validation,
    fromEmail: process.env.GMAIL_FROM_EMAIL || 'admin@koko.toys',
    fromName: process.env.GMAIL_FROM_NAME || 'Koko.toys Admin',
    enabled: !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && validation.isValid)
  };
  
  return config;
}

// Función para mostrar la configuración
function displayGmailConfig() {
  const config = getGmailConfig();
  
  console.log('📧 Configuración de Gmail API:');
  console.log(`   Entorno: ${config.environment}`);
  console.log(`   Client ID: ${config.clientId ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   Client Secret: ${config.clientSecret ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   Redirect URI: ${config.redirectUri}`);
  console.log(`   URI Válida: ${config.validation.isValid ? '✅ Sí' : '❌ No'}`);
  
  if (!config.validation.isValid) {
    console.log(`   Errores de URI:`);
    config.validation.errors.forEach(error => {
      console.log(`     - ${error}`);
    });
  }
  
  console.log(`   From Email: ${config.fromEmail}`);
  console.log(`   From Name: ${config.fromName}`);
  console.log(`   Habilitado: ${config.enabled ? '✅ Sí' : '❌ No'}`);
  console.log('');
  
  if (!config.enabled) {
    console.log('⚠️  Para habilitar Gmail API:');
    console.log('   1. Configura GMAIL_CLIENT_ID en las variables de entorno');
    console.log('   2. Configura GMAIL_CLIENT_SECRET en las variables de entorno');
    console.log('   3. Asegúrate de que el Redirect URI esté configurado en Google Cloud Console');
    console.log('');
  }
  
  console.log('🔗 URLs para configurar en Google Cloud Console:');
  console.log(`   Desarrollo: ${process.env.GMAIL_REDIRECT_URI_DEV || 'http://localhost:3000/auth/callback'}`);
  console.log(`   Producción (EasyPanel): ${process.env.GMAIL_REDIRECT_URI_PROD || 'https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback'}`);
  console.log('');
  console.log('⚠️  IMPORTANTE: La URL de EasyPanel es FIJA y NO se puede cambiar.');
  console.log('   Solo se puede copiar y pegar en Google Cloud Console.');
  console.log('');
  console.log('📋 Requisitos de Google Cloud Console:');
  console.log('   ✅ Debe tener protocolo (http:// o https://)');
  console.log('   ✅ No puede contener fragmentos de URL (#)');
  console.log('   ✅ No puede contener rutas relativas');
  console.log('   ✅ No puede contener comodines (*)');
  console.log('   ✅ No puede ser una dirección IP pública');
  console.log('   ✅ Para producción debe usar HTTPS');
  console.log('');
  
  return config;
}

// Función para generar la URL de autorización
function generateAuthUrl() {
  const config = getGmailConfig();
  
  if (!config.enabled) {
    console.error('❌ Gmail API no está configurada. Configura GMAIL_CLIENT_ID y GMAIL_CLIENT_SECRET.');
    return null;
  }
  
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
  ];
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  console.log('🔗 URL de autorización Gmail API:');
  console.log(authUrl);
  console.log('');
  console.log('📋 Pasos para autorizar:');
  console.log('   1. Abre la URL en tu navegador');
  console.log('   2. Inicia sesión con tu cuenta de Google');
  console.log('   3. Acepta los permisos');
  console.log('   4. Copia el código de autorización');
  console.log('');
  
  return authUrl;
}

// Exportar funciones
module.exports = {
  getGmailConfig,
  displayGmailConfig,
  generateAuthUrl
};

// Si se ejecuta directamente
if (require.main === module) {
  const config = displayGmailConfig();
  
  if (config.enabled) {
    generateAuthUrl();
  }
}
