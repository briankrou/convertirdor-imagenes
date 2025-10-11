# Configuración SMTP con Poste.io

## 🎯 Poste.io - Servidor SMTP Recomendado

**Poste.io** es un excelente servidor de correo que ofrece:
- ✅ Configuración simple y directa
- ✅ Excelente deliverability
- ✅ Soporte para dominios personalizados
- ✅ No requiere configuración especial
- ✅ Muy confiable y estable

## 🔧 Configuración Rápida

### **1. Seleccionar Preset**
1. Ve a **Configuración SMTP**
2. En el dropdown "Preset", selecciona **"Poste.io"**
3. Se configurará automáticamente:
   - Host: `smtp.poste.io`
   - Puerto: `587`
   - Seguro: `false` (TLS)

### **2. Completar Credenciales**
```
Usuario: tu-email@tudominio.com
Contraseña: [Tu contraseña de Poste.io]
Email del remitente: tu-email@tudominio.com
Nombre del remitente: Tu Nombre o Empresa
```

### **3. Probar Configuración**
1. Haz clic en **"Probar conexión"**
2. Si es exitoso, haz clic en **"Enviar email de prueba"**
3. Ingresa un email de destino y envía la prueba

## 📋 Configuración Detallada

### **Configuración SMTP Completa**
```
Host SMTP: smtp.poste.io
Puerto: 587 (TLS) o 465 (SSL)
Conexión segura: TLS (puerto 587) o SSL (puerto 465)
Usuario: tu-email@tudominio.com
Contraseña: [Tu contraseña de Poste.io]
Email del remitente: tu-email@tudominio.com
Nombre del remitente: Tu Nombre
```

### **Puertos Disponibles**
- **587** (TLS) - Recomendado
- **465** (SSL) - Alternativo
- **25** (No recomendado para envío)

## 🚀 Ventajas de Poste.io

### **✅ Fácil Configuración**
- No requiere contraseñas de aplicación
- No necesita 2FA especial
- Configuración directa con email y contraseña

### **✅ Confiabilidad**
- Servidor estable y confiable
- Excelente uptime
- Soporte técnico disponible

### **✅ Deliverability**
- Excelente reputación de envío
- Menos probabilidad de spam
- Aceptado por la mayoría de proveedores

### **✅ Flexibilidad**
- Soporte para dominios personalizados
- Múltiples cuentas de email
- Configuración avanzada disponible

## 🔍 Solución de Problemas

### **Error de Autenticación**
- Verifica que el email y contraseña sean correctos
- Asegúrate de usar el email completo (con dominio)
- Confirma que la cuenta esté activa en Poste.io

### **Error de Conexión**
- Verifica que el host sea `smtp.poste.io`
- Confirma que el puerto sea `587` o `465`
- Comprueba tu conexión a internet

### **Tiempo de Espera**
- El servidor puede estar temporalmente inactivo
- Intenta con el puerto alternativo (465)
- Verifica que no haya restricciones de firewall

## 📧 Ejemplo de Configuración

### **Configuración Básica**
```
Host: smtp.poste.io
Puerto: 587
Seguro: No (TLS)
Usuario: admin@miempresa.com
Contraseña: mi_contraseña_segura
Email del remitente: admin@miempresa.com
Nombre del remitente: Mi Empresa
```

### **Configuración Avanzada**
```
Host: smtp.poste.io
Puerto: 465
Seguro: Sí (SSL)
Usuario: noreply@miempresa.com
Contraseña: contraseña_especial
Email del remitente: noreply@miempresa.com
Nombre del remitente: Sistema de Recuperación
```

## 🎯 Próximos Pasos

1. **Configura Poste.io** usando el preset
2. **Prueba la conexión** para verificar configuración
3. **Envía un email de prueba** para confirmar funcionamiento
4. **Usa la funcionalidad** de recuperación de contraseñas

## 💡 Consejos Adicionales

- **Usa TLS (puerto 587)** para mejor compatibilidad
- **Configura SPF y DKIM** en tu dominio para mejor deliverability
- **Mantén las credenciales seguras** y no las compartas
- **Monitorea los logs** de envío para detectar problemas

---

**¡Poste.io es una excelente opción para tu servidor SMTP!** 🎉

Con esta configuración, tendrás un sistema de email confiable y fácil de usar.
