#!/usr/bin/env node

/**
 * Script de proxy para EasyPanel
 * Maneja el proxy interno de EasyPanel correctamente
 */

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 Iniciando proxy para EasyPanel...');
console.log(`📋 Configuración:`);
console.log(`   Puerto: ${PORT}`);
console.log(`   Host: ${HOST}`);
console.log(`   Modo: Producción`);
console.log(`   Plataforma: EasyPanel`);
console.log(`   URL esperada: http://dbkoko_convertidor-imagenes:80/`);
console.log('');

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, '../dist')));

// Ruta para servir index.html para cualquier ruta no encontrada
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Middleware para manejar todas las rutas de SPA
app.use((req, res, next) => {
  // Si es un archivo estático, continuar
  if (req.path.includes('.')) {
    return next();
  }
  
  // Para todas las demás rutas, servir index.html
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Ruta de health check para EasyPanel
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    host: HOST
  });
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`✅ Servidor proxy iniciado correctamente`);
  console.log(`📱 Acceso local: http://localhost:${PORT}`);
  console.log(`🌐 Acceso externo: http://${HOST}:${PORT}`);
  console.log(`🔗 URL EasyPanel: http://dbkoko_convertidor-imagenes:80/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

// Manejo de errores
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
