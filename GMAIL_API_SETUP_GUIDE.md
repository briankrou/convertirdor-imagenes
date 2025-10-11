# Guía de Configuración Gmail API

## 🎯 **Gmail API - Solución Moderna y Segura**

**¡Excelente decisión!** La Gmail API es mucho mejor que SMTP:

### **✅ Ventajas de Gmail API:**
- 🚀 **Más moderna**: API REST actualizada
- 🔒 **Más segura**: OAuth2 en lugar de contraseñas
- 📈 **Mejor deliverability**: Menos probabilidad de spam
- ⚡ **Más rápida**: Sin límites estrictos de envío
- 🛡️ **Más confiable**: Infraestructura de Google

## 🔧 **Configuración Paso a Paso**

### **Paso 1: Crear Proyecto en Google Cloud Console**

1. **Ve a Google Cloud Console**:
   - URL: https://console.cloud.google.com/
   - Inicia sesión con tu cuenta de Google

2. **Crear nuevo proyecto**:
   - Haz clic en "Seleccionar proyecto"
   - Haz clic en "NUEVO PROYECTO"
   - Nombre: `Koko.toys Email System`
   - Haz clic en "CREAR"

### **Paso 2: Habilitar Gmail API**

1. **Ir a APIs y servicios**:
   - En el menú lateral, ve a "APIs y servicios" > "Biblioteca"

2. **Buscar Gmail API**:
   - Busca "Gmail API"
   - Haz clic en "Gmail API"
   - Haz clic en "HABILITAR"

### **Paso 3: Crear Credenciales OAuth2**

1. **Ir a Credenciales**:
   - Ve a "APIs y servicios" > "Credenciales"
   - Haz clic en "CREAR CREDENCIALES" > "ID de cliente OAuth 2.0"

2. **Configurar pantalla de consentimiento**:
   - Tipo de aplicación: "Aplicación web"
   - Nombre: `Koko.toys Email System`
   - Email de soporte: `admin@koko.toys`
   - Dominio autorizado: `koko.toys`

3. **Crear ID de cliente**:
   - Tipo de aplicación: "Aplicación web"
   - Nombre: `Koko.toys Email Client`
   - URIs de redirección autorizados:
     - `http://localhost:3000/auth/callback`
     - `https://koko.toys/auth/callback`

4. **Obtener credenciales**:
   - Copia el **Client ID**
   - Copia el **Client Secret**

### **Paso 4: Configurar en la Aplicación**

1. **Configuración de Gmail API**:
   ```
   Client ID: [Tu Client ID de Google Cloud]
   Client Secret: [Tu Client Secret de Google Cloud]
   Redirect URI: http://localhost:3000/auth/callback
   Email del remitente: admin@koko.toys
   Nombre del remitente: Koko.toys Admin
   ```

2. **Autorizar aplicación**:
   - Haz clic en "Autorizar con Gmail"
   - Inicia sesión con tu cuenta de Google
   - Acepta los permisos
   - La aplicación obtendrá tokens automáticamente

## 🧪 **Pruebas**

### **1. Probar Conexión**
1. Haz clic en **"Probar conexión"**
2. Debería mostrar: ✅ "Conexión exitosa"

### **2. Enviar Email de Prueba**
1. Ingresa un email de destino
2. Haz clic en **"Enviar email de prueba"**
3. Debería mostrar: ✅ "Email enviado exitosamente"

## 📋 **Configuración Completa**

### **Configuración de Gmail API**
```
Client ID: 123456789-abcdefg.apps.googleusercontent.com
Client Secret: GOCSPX-abcdefghijklmnop
Redirect URI: http://localhost:3000/auth/callback
Email del remitente: admin@koko.toys
Nombre del remitente: Koko.toys Admin
Gmail API Habilitada: ✅
Autorizado: ✅
```

### **Permisos Requeridos**
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.compose`

## 🚀 **Ventajas vs SMTP**

| Característica | SMTP | Gmail API |
|---|---|---|
| **Seguridad** | Contraseñas | OAuth2 |
| **Límites** | Estrictos | Flexibles |
| **Deliverability** | Media | Excelente |
| **Configuración** | Compleja | Simple |
| **Mantenimiento** | Alto | Bajo |

## 🔍 **Solución de Problemas**

### **Error: "No autorizado"**
- **Causa**: No has autorizado la aplicación
- **Solución**: Haz clic en "Autorizar con Gmail"

### **Error: "Client ID inválido"**
- **Causa**: Client ID incorrecto
- **Solución**: Verifica el Client ID en Google Cloud Console

### **Error: "Permisos insuficientes"**
- **Causa**: Gmail API no habilitada
- **Solución**: Habilita Gmail API en Google Cloud Console

### **Error: "Token expirado"**
- **Causa**: Token de acceso expirado
- **Solución**: Reautoriza la aplicación

## 💡 **Consejos Adicionales**

### **Seguridad**
- ✅ Mantén el Client Secret seguro
- ✅ No compartas las credenciales
- ✅ Usa HTTPS en producción
- ✅ Configura dominios autorizados correctamente

### **Optimización**
- ✅ Usa el mismo email para remitente y usuario
- ✅ Configura SPF y DKIM en tu dominio
- ✅ Monitorea los logs de envío
- ✅ Implementa rate limiting si es necesario

## 🎯 **Próximos Pasos**

1. **Configura Google Cloud Console** siguiendo los pasos
2. **Obtén las credenciales** (Client ID y Secret)
3. **Configura la aplicación** con las credenciales
4. **Autoriza con Gmail** usando el botón de autorización
5. **Prueba la conexión** y envío de emails
6. **Usa la funcionalidad** de recuperación de contraseñas

## 📚 **Recursos Adicionales**

- **Google Cloud Console**: https://console.cloud.google.com/
- **Gmail API Documentation**: https://developers.google.com/gmail/api
- **OAuth2 Guide**: https://developers.google.com/identity/protocols/oauth2

---

**¡La Gmail API es la solución perfecta para tu sistema de emails!** 🎉

Con esta configuración, tendrás un sistema de email moderno, seguro y confiable que supera ampliamente a SMTP tradicional.
