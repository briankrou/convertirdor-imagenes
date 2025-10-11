# Requisitos de Google Cloud Console para Redirect URI

## 🎯 **Requisitos Específicos de Google**

Google Cloud Console tiene requisitos estrictos para las URLs de redirección OAuth2:

### **✅ Requisitos Obligatorios:**

1. **Debe tener protocolo**:
   - ✅ `http://` (desarrollo local)
   - ✅ `https://` (producción)

2. **No puede contener fragmentos de URL**:
   - ❌ `https://example.com/auth/callback#fragment`
   - ✅ `https://example.com/auth/callback`

3. **No puede contener rutas relativas**:
   - ❌ `/auth/callback`
   - ❌ `auth/callback`
   - ✅ `https://example.com/auth/callback`

4. **No puede contener comodines**:
   - ❌ `https://*.example.com/auth/callback`
   - ❌ `https://example.com/*/callback`
   - ✅ `https://example.com/auth/callback`

5. **No puede ser una dirección IP pública**:
   - ❌ `https://192.168.1.100:3000/auth/callback`
   - ❌ `https://8.8.8.8/auth/callback`
   - ✅ `https://example.com/auth/callback`

6. **Para producción debe usar HTTPS**:
   - ❌ `http://example.com/auth/callback` (producción)
   - ✅ `https://example.com/auth/callback` (producción)
   - ✅ `http://localhost:3000/auth/callback` (desarrollo)

## 🔧 **URLs Configuradas Correctamente**

### **Desarrollo Local**:
```
http://localhost:3000/auth/callback
```
**✅ Cumple todos los requisitos:**
- ✅ Tiene protocolo (http://)
- ✅ No tiene fragmentos
- ✅ No es ruta relativa
- ✅ No tiene comodines
- ✅ No es IP pública
- ✅ Es localhost (permitido para desarrollo)

### **Producción en EasyPanel**:
```
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```
**✅ Cumple todos los requisitos:**
- ✅ Tiene protocolo (https://)
- ✅ No tiene fragmentos
- ✅ No es ruta relativa
- ✅ No tiene comodines
- ✅ No es IP pública
- ✅ Usa HTTPS (requerido para producción)

## 🧪 **Validación Automática**

### **Script de Validación**:
```bash
npm run gmail:config
```

**Salida esperada**:
```
📧 Configuración de Gmail API:
   Entorno: production
   Client ID: ❌ No configurado
   Client Secret: ❌ No configurado
   Redirect URI: https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
   URI Válida: ✅ Sí
   From Email: admin@koko.toys
   From Name: Koko.toys Admin
   Habilitado: ❌ No

📋 Requisitos de Google Cloud Console:
   ✅ Debe tener protocolo (http:// o https://)
   ✅ No puede contener fragmentos de URL (#)
   ✅ No puede contener rutas relativas
   ✅ No puede contener comodines (*)
   ✅ No puede ser una dirección IP pública
   ✅ Para producción debe usar HTTPS
```

## 🔍 **Ejemplos de URLs Válidas e Inválidas**

### **✅ URLs Válidas**:
```
http://localhost:3000/auth/callback
https://example.com/auth/callback
https://app.example.com/oauth/callback
https://myapp.herokuapp.com/auth/callback
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

### **❌ URLs Inválidas**:
```
# Sin protocolo
example.com/auth/callback

# Con fragmentos
https://example.com/auth/callback#token

# Rutas relativas
/auth/callback
auth/callback

# Con comodines
https://*.example.com/auth/callback
https://example.com/*/callback

# IP pública
https://192.168.1.100:3000/auth/callback
https://8.8.8.8/auth/callback

# HTTP en producción
http://example.com/auth/callback
```

## 🎯 **Configuración en Google Cloud Console**

### **1. Acceder a Credenciales**:
- Google Cloud Console → APIs y servicios → Credenciales
- Seleccionar tu OAuth 2.0 Client ID

### **2. Configurar URIs de Redirección**:
```
# Desarrollo
http://localhost:3000/auth/callback

# Producción
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

### **3. Configurar Dominios Autorizados**:
```
localhost
dbkoko-convertidor-imagenes.mvitku.easypanel.host
```

## 🚀 **Scripts de Validación**

### **Verificar Configuración**:
```bash
npm run gmail:config
```

### **Generar URL de Autorización**:
```bash
npm run gmail:auth
```

## 💡 **Consejos Importantes**

1. **Siempre usar HTTPS en producción**
2. **No usar IPs públicas**
3. **No usar comodines o fragmentos**
4. **Usar rutas absolutas completas**
5. **Validar URLs antes de configurar en Google Cloud Console**

## 📁 **Archivos de Configuración**

- ✅ `environment.config` - URLs configuradas correctamente
- ✅ `env.production` - URLs para producción
- ✅ `scripts/gmail-config.js` - Validación automática
- ✅ `REQUISITOS_GOOGLE_REDIRECT_URI.md` - Esta guía

---

**¡Las URLs están configuradas según los requisitos de Google!** 🎉

Todas las URLs de redirect cumplen con los requisitos estrictos de Google Cloud Console para OAuth2.
