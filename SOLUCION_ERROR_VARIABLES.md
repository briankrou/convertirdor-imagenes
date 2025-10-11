# Solución: Error de Variables de Entorno en npm Scripts

## 🚨 **Problema Identificado**

**Error**: `Error: listen EACCES: permission denied ${PORT:-3000}`

**Causa**: npm no expande correctamente las variables de entorno con sintaxis `${VARIABLE:-default}` en los scripts.

## ✅ **Solución Implementada**

### **1. Scripts de Node.js Creados**

**Antes (Problemático)**:
```json
{
  "scripts": {
    "start": "vite preview --host ${HOST:-0.0.0.0} --port ${PORT:-3000}"
  }
}
```

**Ahora (Solucionado)**:
```json
{
  "scripts": {
    "start": "node scripts/start-server.js"
  }
}
```

### **2. Scripts Creados**

- ✅ `scripts/start-server.js` - Servidor de producción
- ✅ `scripts/dev-server.js` - Servidor de desarrollo
- ✅ `scripts/config.js` - Manejo de configuración

### **3. Funcionalidades de los Scripts**

#### **start-server.js**:
- ✅ **Carga variables de entorno** con dotenv
- ✅ **Valida configuración** antes de iniciar
- ✅ **Verifica directorio dist** existe
- ✅ **Inicia Vite Preview** con configuración correcta
- ✅ **Manejo de señales** (SIGINT, SIGTERM)
- ✅ **Manejo de errores** robusto

#### **dev-server.js**:
- ✅ **Carga variables de entorno** con dotenv
- ✅ **Inicia Vite Dev** con configuración correcta
- ✅ **Manejo de señales** y errores
- ✅ **Logging detallado** de configuración

## 🚀 **Scripts Disponibles**

### **Scripts Principales**:
```bash
# Producción (usa variables de entorno)
npm start                   # Servidor de producción
npm run preview            # Alias para producción

# Desarrollo (usa variables de entorno)
npm run dev                # Servidor de desarrollo
```

### **Scripts Alternativos**:
```bash
# Vite directo (sin variables de entorno)
npm run start:vite         # Vite preview directo
npm run dev:vite           # Vite dev directo

# Express con variables de entorno
npm run start:env          # Express server con dotenv
```

### **Scripts de Configuración**:
```bash
npm run config             # Ver configuración
npm run config:example     # Generar .env.example
npm run env:check          # Verificar variables
```

## 🔧 **Configuración de Variables**

### **Archivo .env**:
```env
# Servidor de producción
PORT=3000
HOST=0.0.0.0

# Servidor de desarrollo
VITE_DEV_PORT=5173
VITE_DEV_HOST=localhost
```

### **Uso de Variables**:
```javascript
// En los scripts
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
```

## 🧪 **Pruebas**

### **1. Verificar Configuración**:
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

### **2. Verificar Variables**:
```bash
npm run env:check
```

**Salida esperada**:
```
Variables cargadas: 17
```

### **3. Iniciar Servidor**:
```bash
npm start
```

**Salida esperada**:
```
🚀 Iniciando servidor de producción...
📋 Configuración:
   Puerto: 3000
   Host: 0.0.0.0
   Modo: Producción (Vite Preview)
```

## 🔍 **Solución de Problemas**

### **Error: "El directorio dist/ no existe"**
```bash
# Construir la aplicación primero
npm run build
npm start
```

### **Error: "Permission denied"**
```bash
# Cambiar puerto en .env
PORT=3001
npm start
```

### **Error: "Variables de entorno requeridas faltantes"**
```bash
# Verificar que .env existe
ls -la .env

# Si no existe, copiar desde plantilla
cp environment.config .env
```

### **Error: "Cannot find module"**
```bash
# Instalar dependencias
npm install
```

## 💡 **Ventajas de la Nueva Implementación**

| Característica | Antes | Ahora |
|---|---|---|
| **Expansión de variables** | ❌ No funciona | ✅ Funciona correctamente |
| **Validación** | ❌ No hay | ✅ Validación completa |
| **Manejo de errores** | ❌ Básico | ✅ Robusto |
| **Logging** | ❌ Limitado | ✅ Detallado |
| **Flexibilidad** | ❌ Limitada | ✅ Alta |

## 🎯 **Próximos Pasos**

1. **Verificar configuración** con `npm run config`
2. **Construir aplicación** con `npm run build`
3. **Iniciar servidor** con `npm start`
4. **Probar acceso** en el puerto configurado

## 📁 **Archivos Creados**

- ✅ `scripts/start-server.js` - Servidor de producción
- ✅ `scripts/dev-server.js` - Servidor de desarrollo
- ✅ `scripts/config.js` - Manejo de configuración
- ✅ `SOLUCION_ERROR_VARIABLES.md` - Esta guía

---

**¡El error de variables de entorno está solucionado!** 🎉

Los scripts ahora manejan correctamente las variables de entorno y proporcionan mejor logging y manejo de errores.
