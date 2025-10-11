#!/usr/bin/env node

/**
 * Script para verificar el estado de los tokens de Gmail API
 */

console.log('🔍 Verificando estado de tokens de Gmail API...\n');

// Simular localStorage para verificar estructura
const mockLocalStorage = {
  userSettings: JSON.stringify({
    gmailApiSettings: {
      clientId: '863976499761-mhlce5h5mbkmmeh31rcq28tfb6kps690.apps.googleusercontent.com',
      clientSecret: 'GOCSPX-...',
      redirectUri: 'https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback.html',
      fromEmail: 'admin@koko.toys',
      fromName: 'Koko.toys Admin',
      enabled: true,
      accessToken: 'ya29.a0AfH6SMC...',
      refreshToken: '1//04...'
    }
  })
};

function checkTokens() {
  try {
    const userSettings = JSON.parse(mockLocalStorage.userSettings);
    const gmailSettings = userSettings.gmailApiSettings || {};
    
    console.log('📊 Estado de configuración Gmail API:');
    console.log(`   Client ID: ${gmailSettings.clientId ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`   Client Secret: ${gmailSettings.clientSecret ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`   Redirect URI: ${gmailSettings.redirectUri || '❌ No configurado'}`);
    console.log(`   From Email: ${gmailSettings.fromEmail || '❌ No configurado'}`);
    console.log(`   From Name: ${gmailSettings.fromName || '❌ No configurado'}`);
    console.log(`   Habilitado: ${gmailSettings.enabled ? '✅ Sí' : '❌ No'}`);
    console.log(`   Access Token: ${gmailSettings.accessToken ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`   Refresh Token: ${gmailSettings.refreshToken ? '✅ Configurado' : '❌ No configurado'}`);
    
    console.log('\n🔍 Verificación de tokens:');
    if (gmailSettings.accessToken && gmailSettings.refreshToken) {
      console.log('✅ Tokens encontrados - Gmail API debería estar funcional');
      console.log(`   Access Token: ${gmailSettings.accessToken.substring(0, 20)}...`);
      console.log(`   Refresh Token: ${gmailSettings.refreshToken.substring(0, 20)}...`);
    } else {
      console.log('❌ Tokens no encontrados - Necesitas autorizar la aplicación');
      if (!gmailSettings.accessToken) {
        console.log('   - Access Token faltante');
      }
      if (!gmailSettings.refreshToken) {
        console.log('   - Refresh Token faltante');
      }
    }
    
    console.log('\n📋 Pasos para solucionar:');
    if (!gmailSettings.clientId || !gmailSettings.clientSecret) {
      console.log('1. Configurar Client ID y Client Secret en la aplicación');
    }
    if (!gmailSettings.accessToken || !gmailSettings.refreshToken) {
      console.log('2. Hacer clic en "Autorizar con Gmail"');
      console.log('3. Completar autorización en Google');
      console.log('4. Verificar que los tokens se guarden en localStorage');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar tokens:', error.message);
  }
}

checkTokens();

console.log('\n💡 Para verificar en el navegador:');
console.log('1. Abrir DevTools (F12)');
console.log('2. Ir a Application/Storage > Local Storage');
console.log('3. Buscar "userSettings"');
console.log('4. Verificar que gmailApiSettings tenga accessToken y refreshToken');
