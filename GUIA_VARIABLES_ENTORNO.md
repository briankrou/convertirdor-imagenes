# Guía de Variables de Entorno

## 🎯 **Configuración con .env**

He implementado un sistema completo de variables de entorno para configurar el servidor y la aplicación.

## 📁 **Archivos Creados**

### **1. Archivo de Configuración**
- ✅ `.env` - Variables de entorno (creado automáticamente)
- ✅ `environment.config` - Plantilla de configuración
- ✅ `scripts/config.js` - Script de manejo de configuración

### **2. Dependencias**
- ✅ `dotenv` - Para cargar variables de entorno

## ⚙️ **Variables de Entorno Disponibles**

### **Configuración del Servidor**
```env
PORT=3000                    # Puerto del servidor
HOST=0.0.0.0                # Host del servidor
```

### **Configuración de Desarrollo**
```env
VITE_DEV_PORT=5173          # Puerto de desarrollo
VITE_DEV_HOST=localhost     # Host de desarrollo
```

### **Configuración de la Aplicación**
```env
APP_NAME=Convertidor de Imágenes
APP_VERSION=1.0.0
APP_DESCRIPTION=Sistema de conversión de imágenes con IA
```

### **Configuración de Gmail API**
```env
GMAIL_CLIENT_ID=            # Client ID de Google Cloud
GMAIL_CLIENT_SECRET=        # Client Secret de Google Cloud
GMAIL_REDIRECT_URI=http://localhost:3000/auth/callback
```

### **Configuración de Base de Datos**
```env
DB_PATH=./data/database.json
```

### **Configuración de Logging**
```env
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### **Configuración de Seguridad**
```env
SESSION_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
```

### **Configuración de CORS**
```env
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

## 🚀 **Scripts Disponibles**

### **Scripts Principales**
```bash
# Servidor de producción (usa variables de entorno)
npm start                   # Vite preview con variables de entorno

# Servidor de desarrollo (usa variables de entorno)
npm run dev                 # Vite dev con variables de entorno

# Servidor Express con variables de entorno
npm run start:env           # Express server con dotenv
```

### **Scripts de Configuración**
```bash
# Ver configuración actual
npm run config              # Muestra configuración cargada

# Generar archivo .env.example
npm run config:example      # Crea .env.example

# Verificar variables cargadas
npm run env:check           # Cuenta variables cargadas
```

## 🔧 **Uso de Variables de Entorno**

### **1. Configurar Puerto Personalizado**
```env
# En archivo .env
PORT=8080
HOST=localhost
```

### **2. Configurar Desarrollo**
```env
# En archivo .env
VITE_DEV_PORT=3001
VITE_DEV_HOST=0.0.0.0
```

### **3. Configurar Gmail API**
```env
# En archivo .env
GMAIL_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GMAIL_REDIRECT_URI=http://localhost:3000/auth/callback
```

## 📋 **Ejemplos de Uso**

### **Cambiar Puerto del Servidor**
```bash
# Editar .env
PORT=8080

# Iniciar servidor
npm start
# Servidor iniciará en puerto 8080
```

### **Cambiar Host del Servidor**
```bash
# Editar .env
HOST=localhost

# Iniciar servidor
npm start
# Servidor solo accesible localmente
```

### **Configurar Desarrollo**
```bash
# Editar .env
VITE_DEV_PORT=3001
VITE_DEV_HOST=0.0.0.0

# Iniciar desarrollo
npm run dev
# Servidor de desarrollo en puerto 3001
```

## 🧪 **Verificar Configuración**

### **1. Ver Configuración Actual**
```bash
npm run config
```

**Salida esperada**:
```
📋 Configuración actual:
   Puerto: 3000
   Host: 0.0.0.0
   Puerto Dev: 5173
   Host Dev: localhost
   App: Convertidor de Imágenes
✅ Configuración cargada correctamente
```

### **2. Verificar Variables Cargadas**
```bash
npm run env:check
```

**Salida esperada**:
```
Variables cargadas: 15
```

## 🔍 **Solución de Problemas**

### **Error: "Variables de entorno requeridas faltantes"**
```bash
# Verificar que .env existe
ls -la .env

# Si no existe, copiar desde plantilla
cp environment.config .env
```

### **Error: "Puerto ya en uso"**
```bash
# Cambiar puerto en .env
PORT=3001

# Reiniciar servidor
npm start
```

### **Error: "No se puede conectar"**
```bash
# Verificar configuración
npm run config

# Verificar que el puerto es correcto
netstat -ano | findstr :3000
```

## 💡 **Consejos**

- **Usa .env para configuración local**
- **No commites .env al repositorio**
- **Usa .env.example como plantilla**
- **Verifica configuración con `npm run config`**
- **Cambia puertos si hay conflictos**

## 🎯 **Próximos Pasos**

1. **Editar archivo .env** con tu configuración
2. **Verificar configuración** con `npm run config`
3. **Iniciar servidor** con `npm start`
4. **Probar acceso** en el puerto configurado

---

**¡Las variables de entorno están configuradas!** 🎉

Ahora puedes personalizar completamente la configuración del servidor y la aplicación usando el archivo .env.
