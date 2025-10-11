#!/usr/bin/env node

/**
 * Script de inicio del servidor de producción
 * Maneja variables de entorno correctamente
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Cargar configuración
const config = require('./config.js');
const envConfig = config.loadEnvFile();

// Aplicar configuración
config.applyConfig(envConfig);

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 Iniciando servidor de producción...');
console.log(`📋 Configuración:`);
console.log(`   Puerto: ${PORT}`);
console.log(`   Host: ${HOST}`);
console.log(`   Modo: Producción (Vite Preview)`);
console.log('');

// Verificar que el directorio dist existe
const distPath = path.join(process.cwd(), 'dist');
const fs = require('fs');

if (!fs.existsSync(distPath)) {
  console.error('❌ Error: El directorio dist/ no existe.');
  console.error('   Ejecuta "npm run build" primero para construir la aplicación.');
  process.exit(1);
}

// Iniciar servidor Vite Preview
const viteProcess = spawn('npx', [
  'vite',
  'preview',
  '--host', HOST,
  '--port', PORT.toString()
], {
  stdio: 'inherit',
  shell: true
});

// Manejo de señales
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  viteProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo servidor...');
  viteProcess.kill('SIGTERM');
  process.exit(0);
});

// Manejo de errores
viteProcess.on('error', (error) => {
  console.error('❌ Error al iniciar servidor:', error.message);
  process.exit(1);
});

viteProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Servidor terminó con código ${code}`);
    process.exit(code);
  }
});
