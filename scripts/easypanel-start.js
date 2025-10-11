#!/usr/bin/env node

/**
 * Script de inicio específico para EasyPanel
 * Optimizado para despliegue en contenedores
 */

// Configurar variables de entorno para EasyPanel
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3000;
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.EASYPANEL = 'true';

console.log('🚀 Iniciando aplicación en EasyPanel...');
console.log(`📋 Configuración:`);
console.log(`   Puerto: ${process.env.PORT}`);
console.log(`   Host: ${process.env.HOST}`);
console.log(`   Modo: ${process.env.NODE_ENV}`);
console.log(`   Plataforma: EasyPanel`);
console.log('');

// Verificar que el directorio dist existe
const fs = require('fs');
const path = require('path');
const distPath = path.join(process.cwd(), 'dist');

if (!fs.existsSync(distPath)) {
  console.error('❌ Error: El directorio dist/ no existe.');
  console.error('   La aplicación debe construirse antes del despliegue.');
  process.exit(1);
}

// Verificar que index.html existe
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ Error: El archivo dist/index.html no existe.');
  console.error('   La aplicación no se construyó correctamente.');
  process.exit(1);
}

console.log('✅ Archivos de construcción verificados');

// Importar y ejecutar el script de inicio principal
try {
  require('./start-server.js');
} catch (error) {
  console.error('❌ Error al iniciar servidor:', error.message);
  process.exit(1);
}
