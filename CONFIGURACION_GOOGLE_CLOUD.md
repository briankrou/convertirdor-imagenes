# Configuración en Google Cloud Console

## 🎯 **URL Fija de EasyPanel**

**IMPORTANTE**: La URL de EasyPanel es **FIJA** y **NO SE PUEDE CAMBIAR**. Solo se puede copiar y pegar en Google Cloud Console.

### **URL Fija de EasyPanel**:
```
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

**⚠️ Esta URL es generada automáticamente por EasyPanel y no se puede modificar.**

## 🔧 **Pasos para Configurar en Google Cloud Console**

### **1. Acceder a Google Cloud Console**
- URL: https://console.cloud.google.com/
- Iniciar sesión con tu cuenta de Google
- Seleccionar tu proyecto

### **2. Ir a APIs y Servicios**
1. **Menú lateral** → **APIs y servicios**
2. **Hacer clic en "Credenciales"**
3. **Buscar tu OAuth 2.0 Client ID** (o crear uno nuevo)

### **3. Configurar URIs de Redirección**
1. **Hacer clic en tu OAuth 2.0 Client ID**
2. **En la sección "URIs de redirección autorizados"**
3. **Hacer clic en "AGREGAR URI"**
4. **Copiar y pegar exactamente esta URL**:

```
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

### **4. Configurar Dominios Autorizados**
1. **En la sección "Dominios autorizados"**
2. **Hacer clic en "AGREGAR DOMINIO"**
3. **Copiar y pegar exactamente este dominio**:

```
dbkoko-convertidor-imagenes.mvitku.easypanel.host
```

### **5. Guardar Cambios**
1. **Hacer clic en "GUARDAR"**
2. **Esperar a que se actualice la configuración**

## 📋 **Configuración Completa**

### **URIs de Redirección Autorizados**:
```
# Desarrollo local (opcional)
http://localhost:3000/auth/callback

# Producción EasyPanel (OBLIGATORIO)
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

### **Dominios Autorizados**:
```
# Desarrollo local (opcional)
localhost

# Producción EasyPanel (OBLIGATORIO)
dbkoko-convertidor-imagenes.mvitku.easypanel.host
```

## ⚠️ **Importante**

### **URL Fija de EasyPanel**:
- ✅ **NO se puede cambiar** en EasyPanel
- ✅ **NO se puede personalizar**
- ✅ **Es generada automáticamente**
- ✅ **Solo se puede copiar y pegar** en Google Cloud Console

### **Formato de URL**:
```
https://[nombre-proyecto].[usuario].easypanel.host/auth/callback
```

**En tu caso**:
```
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

## 🧪 **Verificar Configuración**

### **1. Verificar en Google Cloud Console**:
- ✅ URI de redirección agregada
- ✅ Dominio autorizado agregado
- ✅ Cambios guardados

### **2. Verificar en la Aplicación**:
```bash
npm run gmail:config
```

**Salida esperada**:
```
📧 Configuración de Gmail API:
   Entorno: production
   Redirect URI: https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
   URI Válida: ✅ Sí
```

## 🔍 **Solución de Problemas**

### **Error: "redirect_uri_mismatch"**
- ✅ **Solución**: Copiar exactamente la URL de EasyPanel
- ✅ **Verificar**: Que no haya espacios o caracteres extra
- ✅ **Verificar**: Que esté en la lista de URIs autorizados

### **Error: "unauthorized_client"**
- ✅ **Solución**: Agregar el dominio a dominios autorizados
- ✅ **Verificar**: Que el dominio esté exactamente como aparece en EasyPanel

### **Error: "access_denied"**
- ✅ **Solución**: Verificar que la aplicación esté autorizada
- ✅ **Verificar**: Que el usuario tenga permisos

## 💡 **Consejos**

1. **Copiar exactamente** la URL de EasyPanel
2. **No modificar** la URL en ningún momento
3. **Verificar** que no haya espacios al copiar
4. **Guardar** los cambios en Google Cloud Console
5. **Esperar** unos minutos para que se actualice

## 📁 **Archivos de Referencia**

- ✅ `environment.config` - URLs configuradas
- ✅ `scripts/gmail-config.js` - Validación de URLs
- ✅ `CONFIGURACION_GOOGLE_CLOUD.md` - Esta guía

---

**¡La URL de EasyPanel es fija y solo se copia en Google Cloud Console!** 🎉

No intentes cambiar la URL en EasyPanel, solo cópiala y pégala en la configuración de Google Cloud Console.
