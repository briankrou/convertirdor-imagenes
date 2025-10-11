# Guía de Autorización Gmail API

## Resumen

Esta guía explica cómo configurar y usar el flujo de autorización de Gmail API en la aplicación.

## Flujo de Autorización

### 1. Configuración Inicial

1. **Configurar credenciales en Google Cloud Console:**
   - Client ID
   - Client Secret
   - Redirect URI (debe coincidir exactamente)

2. **Configurar en la aplicación:**
   - Ir a "Configurar Gmail API"
   - Ingresar Client ID y Client Secret
   - Verificar que la Redirect URI sea correcta

### 2. Proceso de Autorización

1. **Iniciar autorización:**
   - Hacer clic en "Autorizar con Gmail"
   - Se abre una ventana popup con Google OAuth

2. **Autorizar en Google:**
   - Seleccionar la cuenta de Gmail
   - Aceptar los permisos solicitados
   - Google redirige a la URL de callback

3. **Procesamiento del callback:**
   - La aplicación detecta automáticamente la página de callback
   - Intercambia el código de autorización por tokens
   - Guarda los tokens en la configuración del usuario

4. **Finalización:**
   - La ventana popup se cierra automáticamente
   - La aplicación muestra confirmación de éxito
   - Los tokens se guardan en la base de datos

## Componentes Involucrados

### 1. GmailApiConfig.tsx
- Interfaz principal de configuración
- Botón "Autorizar con Gmail"
- Manejo de la ventana popup
- Escucha de mensajes de la ventana de callback

### 2. GmailCallback.tsx
- Página de callback que se abre en la ventana popup
- Procesa el código de autorización
- Intercambia código por tokens
- Envía mensajes a la ventana padre

### 3. gmailApiService.ts
- Servicio principal de Gmail API
- Genera URL de autorización
- Intercambia código por tokens
- Maneja errores de autorización

### 4. App.tsx
- Detecta automáticamente la página de callback
- Maneja el estado de autorización
- Guarda la configuración actualizada

## URLs de Redirección

### Desarrollo
```
http://localhost:3000/auth/callback
```

### Producción (EasyPanel)
```
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

## Configuración en Google Cloud Console

### 1. Crear Proyecto
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto o seleccionar existente
3. Habilitar Gmail API

### 2. Configurar OAuth2
1. Ir a "Credenciales" > "Crear credenciales" > "ID de cliente OAuth 2.0"
2. Configurar pantalla de consentimiento
3. Agregar URI de redirección autorizada:
   - `http://localhost:3000/auth/callback` (desarrollo)
   - `https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback` (producción)

### 3. Obtener Credenciales
1. Copiar Client ID y Client Secret
2. Configurar en la aplicación

## Permisos Requeridos

La aplicación solicita los siguientes permisos:
- `https://www.googleapis.com/auth/gmail.send` - Enviar emails
- `https://www.googleapis.com/auth/gmail.compose` - Componer emails

## Manejo de Errores

### Errores Comunes

1. **"redirect_uri_mismatch"**
   - La URL de redirección no coincide
   - Verificar configuración en Google Cloud Console

2. **"invalid_client"**
   - Client ID o Client Secret incorrectos
   - Verificar credenciales en la aplicación

3. **"access_denied"**
   - Usuario canceló la autorización
   - Intentar nuevamente

4. **"invalid_grant"**
   - Token expirado o inválido
   - Reautorizar la aplicación

### Solución de Problemas

1. **Verificar configuración:**
   ```bash
   npm run gmail:config
   ```

2. **Limpiar caché del navegador**
3. **Verificar que la URL de redirección sea exacta**
4. **Revisar logs de la consola del navegador**

## Seguridad

### Mejores Prácticas

1. **Nunca exponer Client Secret en el frontend**
2. **Usar HTTPS en producción**
3. **Validar tokens antes de usar**
4. **Implementar refresh de tokens**

### Consideraciones

- Los tokens se almacenan en el navegador
- Se recomienda implementar refresh automático
- Considerar usar backend para manejar tokens

## Testing

### Probar Autorización

1. **Configurar credenciales**
2. **Hacer clic en "Autorizar con Gmail"**
3. **Verificar que se abra la ventana popup**
4. **Completar autorización en Google**
5. **Verificar que la ventana se cierre automáticamente**
6. **Confirmar que aparezca "Autorizado: Sí"**

### Probar Envío de Emails

1. **Configurar email de remitente**
2. **Hacer clic en "Probar conexión"**
3. **Ingresar email de prueba**
4. **Hacer clic en "Enviar email de prueba"**
5. **Verificar que llegue el email**

## Troubleshooting

### La ventana popup no se abre
- Verificar que el navegador permita popups
- Verificar que la URL de autorización sea válida

### Error al intercambiar código por tokens
- Verificar Client Secret
- Verificar que la URL de redirección coincida exactamente

### Los tokens no se guardan
- Verificar que el usuario esté autenticado
- Verificar permisos de la base de datos

## Logs y Debugging

### Habilitar Logs Detallados

```javascript
// En la consola del navegador
localStorage.setItem('debug', 'gmail-api');
```

### Verificar Estado de Autorización

```javascript
// En la consola del navegador
const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
console.log('Gmail API Settings:', settings.gmailApiSettings);
```

## Conclusión

El flujo de autorización de Gmail API está completamente implementado y funcional. La aplicación maneja automáticamente:

- Detección de la página de callback
- Intercambio de código por tokens
- Guardado de configuración
- Manejo de errores
- Interfaz de usuario intuitiva

Para usar la funcionalidad, solo necesitas configurar las credenciales en Google Cloud Console y en la aplicación.
