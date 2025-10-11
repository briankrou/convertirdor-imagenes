# Guía de Despliegue en EasyPanel

## 🎯 **Configuración para EasyPanel**

He configurado la aplicación para que se despliegue correctamente en EasyPanel con todas las optimizaciones necesarias.

## 📁 **Archivos de Configuración Creados**

### **1. Configuración de EasyPanel**
- ✅ `easypanel.yml` - Configuración del servicio
- ✅ `Dockerfile` - Imagen Docker optimizada
- ✅ `.dockerignore` - Archivos a ignorar en Docker
- ✅ `env.production` - Variables de entorno para producción

### **2. Scripts Específicos**
- ✅ `scripts/easypanel-start.js` - Script optimizado para EasyPanel
- ✅ Scripts Docker para pruebas locales

## ⚙️ **Configuración de EasyPanel**

### **easypanel.yml**
```yaml
name: convertidor-imagenes
description: Sistema de conversión de imágenes con IA

services:
  - name: convertidor-imagenes
    type: app
    source:
      type: git
      repository: # URL de tu repositorio Git
      branch: main
    build:
      type: nodejs
      nodeVersion: 18
      buildCommand: npm run build
      startCommand: npm run start:easypanel
    environment:
      - name: NODE_ENV
        value: production
      - name: PORT
        value: 3000
      - name: HOST
        value: 0.0.0.0
    domains:
      - name: convertidor-imagenes.yourdomain.com
        ssl: true
    resources:
      cpu: 0.5
      memory: 512
    healthCheck:
      path: /
      port: 3000
      interval: 30
      timeout: 10
      retries: 3
```

## 🐳 **Configuración Docker**

### **Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
CMD ["npm", "start"]
```

### **Variables de Entorno para Producción**
```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
APP_NAME=Convertidor de Imágenes
DB_PATH=/app/data/database.json
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

## 🚀 **Scripts Disponibles**

### **Scripts para EasyPanel**:
```bash
# Script específico para EasyPanel
npm run start:easypanel

# Scripts Docker para pruebas
npm run docker:build
npm run docker:run
```

### **Scripts de Desarrollo**:
```bash
# Desarrollo local
npm run dev

# Producción local
npm start
```

## 📋 **Pasos para Desplegar en EasyPanel**

### **1. Preparar el Repositorio**
```bash
# Asegurar que todos los archivos están committeados
git add .
git commit -m "Configuración para EasyPanel"
git push origin main
```

### **2. Configurar en EasyPanel**
1. **Crear nuevo proyecto** en EasyPanel
2. **Conectar repositorio Git**
3. **Configurar variables de entorno**:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `HOST=0.0.0.0`
4. **Configurar dominio** (opcional)
5. **Configurar SSL** (recomendado)

### **3. Variables de Entorno en EasyPanel**
```env
# Configuración básica
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Configuración de la aplicación
APP_NAME=Convertidor de Imágenes
APP_VERSION=1.0.0

# Configuración de base de datos
DB_PATH=/app/data/database.json

# Configuración de logging
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log

# Configuración de seguridad
SESSION_SECRET=your-production-secret-key
JWT_SECRET=your-production-jwt-secret

# Configuración de CORS
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

# Configuración de Gmail API
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=https://yourdomain.com/auth/callback
```

## 🔧 **Configuración del Host**

### **Host Configurado Correctamente**:
- ✅ **HOST=0.0.0.0** - Acepta conexiones de cualquier IP
- ✅ **PORT=3000** - Puerto estándar para aplicaciones web
- ✅ **NODE_ENV=production** - Modo de producción
- ✅ **SSL habilitado** - Conexiones seguras

### **Configuración de CORS**:
```env
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true
```

## 🧪 **Pruebas Locales**

### **1. Probar con Docker**:
```bash
# Construir imagen
npm run docker:build

# Ejecutar contenedor
npm run docker:run

# Probar en http://localhost:3000
```

### **2. Probar Script de EasyPanel**:
```bash
# Configurar variables de entorno
export NODE_ENV=production
export PORT=3000
export HOST=0.0.0.0

# Ejecutar script
npm run start:easypanel
```

## 🔍 **Solución de Problemas**

### **Error: "Puerto no disponible"**
- Verificar que `PORT=3000` esté configurado
- EasyPanel asigna automáticamente el puerto

### **Error: "Host no configurado"**
- Verificar que `HOST=0.0.0.0` esté configurado
- Esto permite conexiones externas

### **Error: "Aplicación no responde"**
- Verificar health check en `/`
- Verificar que el puerto 3000 esté expuesto

### **Error: "Variables de entorno faltantes"**
- Configurar todas las variables en EasyPanel
- Usar `env.production` como referencia

## 💡 **Optimizaciones para EasyPanel**

### **Recursos Configurados**:
- **CPU**: 0.5 cores
- **Memoria**: 512 MB
- **Health Check**: Cada 30 segundos
- **Timeout**: 10 segundos
- **Reintentos**: 3

### **Configuración de Red**:
- **Puerto expuesto**: 3000
- **Host**: 0.0.0.0 (todas las interfaces)
- **SSL**: Habilitado
- **CORS**: Configurado para dominio de producción

## 🎯 **Próximos Pasos**

1. **Configurar repositorio Git** con todos los archivos
2. **Crear proyecto en EasyPanel**
3. **Configurar variables de entorno**
4. **Configurar dominio y SSL**
5. **Desplegar y probar**

## 📁 **Archivos de Configuración**

- ✅ `easypanel.yml` - Configuración del servicio
- ✅ `Dockerfile` - Imagen Docker
- ✅ `.dockerignore` - Archivos ignorados
- ✅ `env.production` - Variables de producción
- ✅ `scripts/easypanel-start.js` - Script optimizado
- ✅ `GUIA_DESPLIEGUE_EASYPANEL.md` - Esta guía

---

**¡La aplicación está lista para EasyPanel!** 🎉

La configuración incluye todas las optimizaciones necesarias para un despliegue exitoso en EasyPanel con host configurado correctamente.
