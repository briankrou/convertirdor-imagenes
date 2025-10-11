# Guía: Configuración de Redirect URI para Gmail API

## 🎯 **Configuración de URLs de Redirect**

He configurado las URLs de redirect correctas para Gmail API tanto para desarrollo como para producción en EasyPanel.

## 📁 **Archivos de Configuración Actualizados**

### **1. Variables de Entorno**
- ✅ `environment.config` - URLs de redirect configuradas
- ✅ `env.production` - URLs para producción en EasyPanel
- ✅ `scripts/gmail-config.js` - Script de configuración de Gmail

### **2. Scripts Disponibles**
- ✅ `npm run gmail:config` - Ver configuración de Gmail API
- ✅ `npm run gmail:auth` - Generar URL de autorización

## ⚙️ **URLs de Redirect Configuradas**

### **Desarrollo Local**:
```
http://localhost:3000/auth/callback
```

### **Producción en EasyPanel**:
```
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

## 🔧 **Configuración en Google Cloud Console**

### **1. Acceder a Google Cloud Console**
- URL: https://console.cloud.google.com/
- Proyecto: Tu proyecto de Gmail API

### **2. Configurar OAuth2**
1. **Ir a APIs y servicios** > **Credenciales**
2. **Seleccionar tu OAuth 2.0 Client ID**
3. **Agregar URIs de redirección autorizados**:

```
# Desarrollo
http://localhost:3000/auth/callback

# Producción
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

### **3. Configurar Dominios Autorizados**
```
# Dominios autorizados
localhost
dbkoko-convertidor-imagenes.mvitku.easypanel.host
```

## 🚀 **Scripts de Configuración**

### **Ver Configuración Actual**:
```bash
npm run gmail:config
```

**Salida esperada**:
```
📧 Configuración de Gmail API:
   Entorno: production
   Client ID: ✅ Configurado
   Client Secret: ✅ Configurado
   Redirect URI: https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
   From Email: admin@koko.toys
   From Name: Koko.toys Admin
   Habilitado: ✅ Sí

🔗 URLs para configurar en Google Cloud Console:
   Desarrollo: http://localhost:3000/auth/callback
   Producción: https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

### **Generar URL de Autorización**:
```bash
npm run gmail:auth
```

**Salida esperada**:
```
🔗 URL de autorización Gmail API:
https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...

📋 Pasos para autorizar:
   1. Abre la URL en tu navegador
   2. Inicia sesión con tu cuenta de Google
   3. Acepta los permisos
   4. Copia el código de autorización
```

## 📋 **Variables de Entorno**

### **Desarrollo**:
```env
# Configuración de Gmail API
GMAIL_CLIENT_ID=tu-client-id
GMAIL_CLIENT_SECRET=tu-client-secret
GMAIL_REDIRECT_URI_DEV=http://localhost:3000/auth/callback
GMAIL_REDIRECT_URI=http://localhost:3000/auth/callback
```

### **Producción (EasyPanel)**:
```env
# Configuración de Gmail API
GMAIL_CLIENT_ID=tu-client-id
GMAIL_CLIENT_SECRET=tu-client-secret
GMAIL_REDIRECT_URI_PROD=https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
GMAIL_REDIRECT_URI=https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

## 🧪 **Pruebas**

### **1. Verificar Configuración**:
```bash
npm run gmail:config
```

### **2. Probar URL de Autorización**:
```bash
npm run gmail:auth
```

### **3. Verificar en Google Cloud Console**:
- ✅ URIs de redirección configuradas
- ✅ Dominios autorizados configurados
- ✅ OAuth2 Client ID activo

## 🔍 **Solución de Problemas**

### **Error: "redirect_uri_mismatch"**
- ✅ **Solucionado**: URLs configuradas correctamente
- Verificar que las URLs estén en Google Cloud Console
- Verificar que no haya espacios o caracteres especiales

### **Error: "invalid_client"**
- Verificar que GMAIL_CLIENT_ID esté configurado
- Verificar que GMAIL_CLIENT_SECRET esté configurado
- Verificar que las credenciales sean correctas

### **Error: "access_denied"**
- Verificar que el usuario tenga permisos
- Verificar que la aplicación esté autorizada
- Verificar que los scopes sean correctos

## 💡 **Configuración Automática**

### **Script de Configuración**:
```javascript
// scripts/gmail-config.js
function getGmailConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isEasyPanel = process.env.EASYPANEL === 'true' || process.env.PORT;
  
  const redirectUris = {
    development: 'http://localhost:3000/auth/callback',
    production: 'https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback'
  };
  
  const environment = isProduction || isEasyPanel ? 'production' : 'development';
  const redirectUri = redirectUris[environment];
  
  return { environment, redirectUri, ... };
}
```

## 🎯 **Pasos para Configurar**

### **1. En Google Cloud Console**:
1. **Crear proyecto** (si no existe)
2. **Habilitar Gmail API**
3. **Crear credenciales OAuth2**
4. **Configurar URIs de redirección**:
   - `http://localhost:3000/auth/callback`
   - `https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback`
5. **Configurar dominios autorizados**

### **2. En EasyPanel**:
1. **Configurar variables de entorno**:
   - `GMAIL_CLIENT_ID`
   - `GMAIL_CLIENT_SECRET`
   - `GMAIL_REDIRECT_URI`
2. **Desplegar aplicación**

### **3. Probar Configuración**:
1. **Verificar configuración**: `npm run gmail:config`
2. **Generar URL de autorización**: `npm run gmail:auth`
3. **Probar autorización** en el navegador

## 📁 **Archivos Creados/Modificados**

- ✅ `environment.config` - URLs de redirect configuradas
- ✅ `env.production` - URLs para producción
- ✅ `scripts/gmail-config.js` - Script de configuración
- ✅ `package.json` - Scripts de Gmail API
- ✅ `GUIA_GMAIL_API_REDIRECT.md` - Esta guía

---

**¡Las URLs de Redirect están configuradas correctamente!** 🎉

Ahora puedes configurar Gmail API en Google Cloud Console con las URLs correctas para desarrollo y producción.
