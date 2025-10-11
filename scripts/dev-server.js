#!/usr/bin/env node

/**
 * Script de inicio del servidor de desarrollo
 * Maneja variables de entorno correctamente
 */

require('dotenv').config();
const { spawn } = require('child_process');

// Cargar configuración
const config = require('./config.js');
const envConfig = config.loadEnvFile();

// Aplicar configuración
config.applyConfig(envConfig);

// Configuración del servidor de desarrollo
const PORT = process.env.VITE_DEV_PORT || 5173;
const HOST = process.env.VITE_DEV_HOST || 'localhost';

console.log('🚀 Iniciando servidor de desarrollo...');
console.log(`📋 Configuración:`);
console.log(`   Puerto: ${PORT}`);
console.log(`   Host: ${HOST}`);
console.log(`   Modo: Desarrollo (Vite Dev)`);
console.log('');

// Iniciar servidor Vite Dev
const viteProcess = spawn('npx', [
  'vite',
  '--host', HOST,
  '--port', PORT.toString()
], {
  stdio: 'inherit',
  shell: true
});

// Manejo de señales
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor de desarrollo...');
  viteProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo servidor de desarrollo...');
  viteProcess.kill('SIGTERM');
  process.exit(0);
});

// Manejo de errores
viteProcess.on('error', (error) => {
  console.error('❌ Error al iniciar servidor de desarrollo:', error.message);
  process.exit(1);
});

viteProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Servidor de desarrollo terminó con código ${code}`);
    process.exit(code);
  }
});
