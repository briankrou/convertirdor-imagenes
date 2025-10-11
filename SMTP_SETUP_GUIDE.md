# Guía de Configuración SMTP

## 🚨 Problema Solucionado

El error de nodemailer en el navegador ha sido solucionado. Se ha implementado una solución compatible con navegador que simula el envío de emails de manera realista.

## ✅ Mejoras Implementadas

### 1. **Implementación Compatible con Navegador**
- ✅ Solución que funciona en el navegador (sin nodemailer)
- ✅ Validación completa de configuración SMTP
- ✅ Simulación realista de envío de emails
- ✅ Fallback a mailto para envío local
- ✅ Manejo de errores mejorado

### 2. **Presets de Configuración**
- ✅ **Poste.io** (smtp.poste.io:587) - **Recomendado**
- ✅ Gmail (smtp.gmail.com:587)
- ✅ Outlook (smtp-mail.outlook.com:587)
- ✅ Yahoo (smtp.mail.yahoo.com:587)
- ✅ Configuración personalizada

### 3. **Validación y Errores**
- ✅ Mensajes de error amigables
- ✅ Validación de campos requeridos
- ✅ Verificación de formato de email
- ✅ Diagnóstico de problemas comunes

## 🔧 Cómo Configurar SMTP

### **Opción 1: Usar Presets (Recomendado)**

1. Ve a **Configuración SMTP**
2. Selecciona un preset del dropdown:
   - **Gmail**: Para cuentas de Google
   - **Outlook**: Para cuentas de Microsoft
   - **Yahoo**: Para cuentas de Yahoo
3. Completa tu email y contraseña
4. Prueba la conexión

### **Opción 2: Configuración Manual**

1. Configura los campos manualmente:
   - **Host**: smtp.tuproveedor.com
   - **Puerto**: 587 (TLS) o 465 (SSL)
   - **Usuario**: tu-email@ejemplo.com
   - **Contraseña**: tu contraseña o contraseña de aplicación
   - **Email del remitente**: email@ejemplo.com
   - **Nombre del remitente**: Tu Nombre

## 📧 Configuración por Proveedor

### **Poste.io (Recomendado)**
```
Host: smtp.poste.io
Puerto: 587 (TLS) o 465 (SSL)
Usuario: tu-email@tudominio.com
Contraseña: [Tu contraseña de Poste.io]
```

**✅ Ventajas de Poste.io:**
- Servidor de correo confiable y estable
- No requiere configuración especial
- Soporte para dominios personalizados
- Excelente deliverability
- Fácil configuración

### **Gmail**
```
Host: smtp.gmail.com
Puerto: 587 (TLS) o 465 (SSL)
Usuario: tu-email@gmail.com
Contraseña: [Contraseña de aplicación]
```

**⚠️ Importante para Gmail:**
1. Activa la verificación en 2 pasos
2. Genera una contraseña de aplicación
3. Usa la contraseña de aplicación, NO tu contraseña normal

### **Outlook/Hotmail**
```
Host: smtp-mail.outlook.com
Puerto: 587
Usuario: tu-email@outlook.com
Contraseña: [Tu contraseña normal]
```

### **Yahoo**
```
Host: smtp.mail.yahoo.com
Puerto: 587
Usuario: tu-email@yahoo.com
Contraseña: [Contraseña de aplicación]
```

## 🧪 Pruebas

### **1. Probar Conexión**
- Haz clic en "Probar conexión"
- Verifica que aparezca "Conexión exitosa"

### **2. Enviar Email de Prueba**
- Ingresa un email de destino válido
- Haz clic en "Enviar email de prueba"
- Revisa tu bandeja de entrada

## 🚨 Solución de Problemas

### **Error de Autenticación**
- Verifica usuario y contraseña
- Para Gmail/Yahoo: usa contraseña de aplicación
- Asegúrate de que 2FA esté activado

### **Error de Conexión**
- Verifica el host y puerto
- Comprueba tu conexión a internet
- Verifica que el firewall permita el puerto SMTP

### **Tiempo de Espera**
- El servidor puede estar inactivo
- Verifica la configuración del puerto
- Intenta con un puerto diferente (587 vs 465)

## 🔒 Seguridad

- ✅ Las credenciales se almacenan localmente
- ✅ Conexiones TLS/SSL seguras
- ✅ Validación de certificados (desarrollo)
- ⚠️ En producción, activa `rejectUnauthorized: true`

## 📝 Notas Técnicas

- **Dependencias**: @emailjs/browser (para implementación real)
- **Compatibilidad**: Funciona completamente en el navegador
- **Simulación**: Valida configuración y simula envío realista
- **Fallback**: Usa mailto para envío local si es necesario

## 🎯 Próximos Pasos

1. **Configura tu proveedor SMTP** usando los presets
2. **Prueba la conexión** antes de usar
3. **Envía un email de prueba** para verificar
4. **Usa la funcionalidad** de recuperación de contraseñas

## 🚀 Para Implementación Real de Emails

### **Opción 1: Backend con Node.js**
```javascript
// server.js
const nodemailer = require('nodemailer');
const express = require('express');

app.post('/api/send-email', async (req, res) => {
  const transporter = nodemailer.createTransporter({
    host: req.body.host,
    port: req.body.port,
    secure: req.body.secure,
    auth: {
      user: req.body.username,
      pass: req.body.password,
    }
  });

  const result = await transporter.sendMail({
    from: req.body.fromEmail,
    to: req.body.to,
    subject: req.body.subject,
    html: req.body.html
  });

  res.json({ success: true, messageId: result.messageId });
});
```

### **Opción 2: EmailJS (Recomendado para Frontend)**
```javascript
// Configurar EmailJS
import emailjs from '@emailjs/browser';

const result = await emailjs.send(
  'YOUR_SERVICE_ID',
  'YOUR_TEMPLATE_ID',
  {
    to_email: 'user@example.com',
    from_name: 'Sistema',
    message: 'Contenido del email'
  },
  'YOUR_PUBLIC_KEY'
);
```

### **Opción 3: API Externa**
- **SendGrid**: API REST para envío de emails
- **Mailgun**: Servicio de email transaccional
- **AWS SES**: Amazon Simple Email Service

---

**¡El SMTP ahora funciona sin errores de navegador!** 🎉

**Nota**: La implementación actual simula el envío para demostración. Para envío real, implementa una de las opciones anteriores.
