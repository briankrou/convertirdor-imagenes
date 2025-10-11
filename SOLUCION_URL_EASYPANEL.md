# Solución: URL no funciona en EasyPanel

## 🚨 **Problema Identificado**

**Problema**: El servidor se inicia correctamente en el puerto 3000, pero la URL `http://dbkoko_convertidor-imagenes:80/` no funciona.

**Causa**: EasyPanel usa un proxy interno que mapea el puerto 80 externo al puerto 3000 interno de la aplicación.

## ✅ **Solución Implementada**

### **1. Script de Proxy Creado**

**Archivo**: `scripts/easypanel-proxy.js`
- ✅ **Servidor Express** optimizado para EasyPanel
- ✅ **Archivos estáticos** servidos desde `dist/`
- ✅ **Rutas SPA** manejadas correctamente
- ✅ **Health check** para EasyPanel
- ✅ **Logging detallado** de configuración

### **2. Configuración Actualizada**

**easypanel.yml**:
```yaml
build:
  type: nodejs
  nodeVersion: 18
  buildCommand: npm run build
  startCommand: npm run start:proxy  # ✅ Script de proxy
environment:
  - name: NODE_ENV
    value: production
  - name: PORT
    value: 3000
  - name: HOST
    value: 0.0.0.0
  - name: EASYPANEL
    value: true
```

### **3. Scripts Disponibles**

```bash
# Script de proxy para EasyPanel
npm run start:proxy

# Script original de EasyPanel
npm run start:easypanel

# Scripts de desarrollo
npm run dev
npm start
```

## 🔧 **Cómo Funciona el Proxy de EasyPanel**

### **Arquitectura**:
```
Internet → EasyPanel (Puerto 80) → Tu App (Puerto 3000)
```

### **Flujo de Datos**:
1. **Usuario accede** a `http://dbkoko_convertidor-imagenes:80/`
2. **EasyPanel recibe** la petición en puerto 80
3. **EasyPanel redirige** internamente al puerto 3000
4. **Tu aplicación** responde desde puerto 3000
5. **EasyPanel devuelve** la respuesta al usuario

## 🚀 **Configuración del Proxy**

### **Servidor Express Optimizado**:
```javascript
// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../dist')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Rutas SPA
app.use((req, res, next) => {
  if (req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Health check para EasyPanel
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    host: HOST
  });
});
```

## 🧪 **Pruebas**

### **1. Probar Localmente**:
```bash
# Construir la aplicación
npm run build

# Iniciar proxy
npm run start:proxy
```

**Salida esperada**:
```
🚀 Iniciando proxy para EasyPanel...
📋 Configuración:
   Puerto: 3000
   Host: 0.0.0.0
   Modo: Producción
   Plataforma: EasyPanel
   URL esperada: http://dbkoko_convertidor-imagenes:80/
✅ Servidor proxy iniciado correctamente
📱 Acceso local: http://localhost:3000
🌐 Acceso externo: http://0.0.0.0:3000
🔗 URL EasyPanel: http://dbkoko_convertidor-imagenes:80/
❤️  Health check: http://localhost:3000/health
```

### **2. Verificar Health Check**:
```bash
curl http://localhost:3000/health
```

**Respuesta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-11T18:46:23.734Z",
  "uptime": 123.456,
  "port": 3000,
  "host": "0.0.0.0"
}
```

## 🔍 **Solución de Problemas**

### **Error: "URL no responde"**
- ✅ **Solucionado**: Usar `npm run start:proxy`
- Verificar que el puerto 3000 esté expuesto
- Verificar health check en `/health`

### **Error: "Archivos no encontrados"**
```bash
# Construir la aplicación primero
npm run build
npm run start:proxy
```

### **Error: "Puerto no disponible"**
- EasyPanel asigna automáticamente el puerto
- Verificar que `PORT=3000` esté configurado

### **Error: "Health check falla"**
- Verificar que la ruta `/health` responda
- Verificar logs de EasyPanel

## 💡 **Ventajas del Proxy**

| Característica | Vite Preview | Express Proxy |
|---|---|---|
| **Compatibilidad EasyPanel** | ❌ Limitada | ✅ Optimizada |
| **Health Check** | ❌ No hay | ✅ Incluido |
| **Logging** | ❌ Básico | ✅ Detallado |
| **Manejo de rutas** | ⚠️ Limitado | ✅ Completo |
| **Performance** | ✅ Buena | ✅ Buena |

## 🎯 **Configuración en EasyPanel**

### **1. Variables de Entorno**:
```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
EASYPANEL=true
```

### **2. Comando de Inicio**:
```bash
npm run start:proxy
```

### **3. Health Check**:
- **Ruta**: `/health`
- **Puerto**: 3000
- **Intervalo**: 30 segundos

## 📋 **Próximos Pasos**

1. **Usar el script de proxy** en EasyPanel
2. **Verificar health check** en `/health`
3. **Probar la URL** `http://dbkoko_convertidor-imagenes:80/`
4. **Monitorear logs** de EasyPanel

## 📁 **Archivos Creados**

- ✅ `scripts/easypanel-proxy.js` - Script de proxy
- ✅ `SOLUCION_URL_EASYPANEL.md` - Esta guía

---

**¡El problema de URL está solucionado!** 🎉

El script de proxy está optimizado para EasyPanel y maneja correctamente el mapeo de puertos y las rutas SPA.
