/**
 * Script de configuración para manejar variables de entorno
 */

const fs = require('fs');
const path = require('path');

// Función para cargar variables de entorno desde archivo
function loadEnvFile(envPath = '.env') {
  const fullPath = path.resolve(envPath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Archivo ${envPath} no encontrado. Usando variables por defecto.`);
    return {};
  }

  const envContent = fs.readFileSync(fullPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    
    // Ignorar comentarios y líneas vacías
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

// Función para validar configuración requerida
function validateConfig(config) {
  const required = ['PORT', 'HOST'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Variables de entorno requeridas faltantes: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

// Función para mostrar configuración actual
function displayConfig(config) {
  console.log('📋 Configuración actual:');
  console.log(`   Puerto: ${config.PORT || '3000'}`);
  console.log(`   Host: ${config.HOST || '0.0.0.0'}`);
  console.log(`   Puerto Dev: ${config.VITE_DEV_PORT || '5173'}`);
  console.log(`   Host Dev: ${config.VITE_DEV_HOST || 'localhost'}`);
  console.log(`   App: ${config.APP_NAME || 'Convertidor de Imágenes'}`);
}

// Función para generar archivo .env de ejemplo
function generateEnvExample() {
  const exampleContent = `# Configuración del servidor
PORT=3000
HOST=0.0.0.0

# Configuración de desarrollo
VITE_DEV_PORT=5173
VITE_DEV_HOST=localhost

# Configuración de la aplicación
APP_NAME=Convertidor de Imágenes
APP_VERSION=1.0.0
APP_DESCRIPTION=Sistema de conversión de imágenes con IA

# Configuración de Gmail API (ejemplo)
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=http://localhost:3000/auth/callback

# Configuración de base de datos
DB_PATH=./data/database.json

# Configuración de logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Configuración de seguridad
SESSION_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# Configuración de CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true`;

  fs.writeFileSync('.env.example', exampleContent);
  console.log('✅ Archivo .env.example generado');
}

// Función para aplicar configuración a process.env
function applyConfig(config) {
  Object.keys(config).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = config[key];
    }
  });
}

// Exportar funciones
module.exports = {
  loadEnvFile,
  validateConfig,
  displayConfig,
  generateEnvExample,
  applyConfig
};

// Si se ejecuta directamente
if (require.main === module) {
  const config = loadEnvFile();
  
  if (validateConfig(config)) {
    displayConfig(config);
    applyConfig(config);
    console.log('✅ Configuración cargada correctamente');
  } else {
    console.log('❌ Error en la configuración');
    process.exit(1);
  }
}
