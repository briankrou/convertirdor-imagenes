require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '20mb' }));

// Ruta del archivo de base de datos
const DB_PATH = path.join(__dirname, 'src', 'db', 'db.json');

// API: leer base de datos
app.get('/api/db', (req, res) => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({ userSettings: {}, lastUpdated: new Date().toISOString() });
    }
  } catch (error) {
    console.error('Error leyendo db.json:', error);
    res.status(500).json({ error: 'Error al leer la base de datos' });
  }
});

// API: guardar base de datos
app.post('/api/db', (req, res) => {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error guardando db.json:', error);
    res.status(500).json({ error: 'Error al guardar la base de datos' });
  }
});

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
