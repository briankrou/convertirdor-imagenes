require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Ruta para servir index.html para cualquier ruta no encontrada
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Middleware para manejar todas las rutas de SPA (compatible con Express 5.x)
app.use((req, res, next) => {
  // Si es un archivo estático, continuar
  if (req.path.includes('.')) {
    return next();
  }
  
  // Para todas las demás rutas, servir index.html
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  console.log(`📱 Acceso local: http://localhost:${PORT}`);
  console.log(`🌐 Acceso externo: http://${HOST}:${PORT}`);
  console.log(`⚙️  Configuración desde archivo .env`);
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
