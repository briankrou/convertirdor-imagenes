# Configuración Gmail API

## 📧 Configuración Rápida

### 1. **Google Cloud Console**
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto o seleccionar existente
3. Habilitar Gmail API
4. Crear credenciales OAuth 2.0

### 2. **Credenciales OAuth 2.0**
- **Tipo**: Aplicación web
- **Orígenes JavaScript autorizados**: `https://dbkoko-convertidor-imagenes.mvitku.easypanel.host`
- **URIs de redirección autorizadas**: `https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback`

⚠️ **IMPORTANTE**: La URL de redirección es FIJA y NO se puede modificar. Solo se puede copiar y pegar en Google Cloud Console.

### 3. **Configuración en la Aplicación**
- **Client ID**: Copiar desde Google Cloud Console
- **Client Secret**: Copiar desde Google Cloud Console
- **Email del remitente**: Tu dirección de Gmail
- **Nombre del remitente**: Nombre que aparecerá en los emails

### 4. **Autorización**
1. Configurar credenciales
2. Hacer clic en "Autorizar con Gmail"
3. Completar autorización en Google
4. La ventana se cerrará automáticamente

## ✅ Estado de Configuración

- **Autorizado**: ✅ Verde - Listo para enviar emails
- **No autorizado**: ❌ Rojo - Necesita autorización
- **Configurado**: ✅ Verde - Datos del remitente completos
- **Incompleto**: ⚠️ Naranja - Faltan datos del remitente

## 🔧 Funcionalidades

- **Probar conexión**: Verifica configuración básica
- **Autorizar con Gmail**: Obtiene permisos de usuario
- **Enviar email de prueba**: Prueba el envío de emails
- **Redirect URI**: Campo de solo lectura con botón de copia

## 🚨 Solución de Problemas

### Error: "Configuración incompleta"
- Verificar que Client ID y Client Secret estén configurados

### Error: "Configuración del remitente incompleta"
- Verificar que Email del remitente y Nombre del remitente estén configurados

### Error: "No autorizado"
- Hacer clic en "Autorizar con Gmail" y completar el proceso

### Error: "redirect_uri_mismatch"
- Verificar que la URI de redirección en Google Cloud Console sea exactamente: `https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback`
