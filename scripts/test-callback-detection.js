#!/usr/bin/env node

/**
 * Script para probar la detección de callback de Gmail API
 */

// Función simplificada para detectar callback (copiada de routes.ts)
function isGmailCallbackPage(pathname, search, href) {
  const currentPath = pathname;
  const currentSearch = search;
  const currentHref = href;
  
  // Verificar múltiples patrones para detectar callback
  return currentPath === '/auth/callback' || 
         currentPath === '//auth/callback' ||  // Manejar doble barra
         currentPath.includes('/auth/callback') ||  // Cualquier variación
         currentSearch.includes('code=') || 
         currentSearch.includes('error=') ||
         currentHref.includes('/auth/callback');
}

// Simular diferentes URLs para probar la detección
const testUrls = [
  'https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback?code=123',
  'https://dbkoko-convertidor-imagenes.mvitku.easypanel.host//auth/callback?code=123',
  'https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback?error=access_denied',
  'https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/',
  'https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/gmail-api-config',
  'https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback',
  'https://dbkoko-convertidor-imagenes.mvitku.easypanel.host//auth/callback'
];

console.log('🧪 Probando detección de callback de Gmail API...\n');

testUrls.forEach((url, index) => {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const search = urlObj.search;
  const href = url;
  
  const isCallback = isGmailCallbackPage(pathname, search, href);
  const status = isCallback ? '✅ SÍ' : '❌ NO';
  
  console.log(`${index + 1}. ${url}`);
  console.log(`   Pathname: ${pathname}`);
  console.log(`   Search: ${search}`);
  console.log(`   Detectado como callback: ${status}\n`);
});

console.log('📋 Resumen:');
console.log('- URLs con /auth/callback deberían ser detectadas como callback');
console.log('- URLs con //auth/callback (doble barra) deberían ser detectadas como callback');
console.log('- URLs con ?code= deberían ser detectadas como callback');
console.log('- URLs con ?error= deberían ser detectadas como callback');
console.log('- Otras URLs NO deberían ser detectadas como callback');
