# Guía para Actualizar Google Cloud Console

## 🚨 Problema Actual

La URL de redirección en Google Cloud Console sigue usando la URL antigua:
```
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

**Resultado**: La aplicación se queda en "Autorizando..." y no guarda la autorización.

## ✅ Solución

### 1. **Actualizar Google Cloud Console**

#### Paso 1: Acceder a Google Cloud Console
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Seleccionar el proyecto correcto
3. Ir a **"APIs y servicios"** > **"Credenciales"**

#### Paso 2: Editar Credenciales OAuth2
1. Buscar el **"ID de cliente OAuth 2.0"** que estás usando
2. Hacer clic en el **ícono de edición** (lápiz)
3. En la sección **"URIs de redirección autorizadas"**

#### Paso 3: Actualizar URL de Redirección

**ELIMINAR** la URL antigua:
```
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback
```

**AGREGAR** la nueva URL:
```
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback.html
```

#### Paso 4: Guardar Cambios
1. Hacer clic en **"Guardar"**
2. Esperar a que se actualicen los cambios (puede tomar unos minutos)

### 2. **Verificar Configuración**

#### Verificar que la nueva URL sea accesible:
```bash
# La URL debe devolver Status 200
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback.html
```

#### Verificar configuración local:
```bash
npm run gmail:config
```

**Resultado esperado**:
```
🔗 URLs para configurar en Google Cloud Console:
   Desarrollo: http://localhost:3000/auth/callback.html
   Producción (EasyPanel): https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback.html
```

### 3. **Probar Autorización**

#### Paso 1: Limpiar Caché
1. Abrir DevTools (F12)
2. Ir a **Application/Storage**
3. Limpiar **Local Storage** y **Session Storage**
4. Recargar la página

#### Paso 2: Probar Autorización
1. Ir a **"Configurar Gmail API"**
2. Verificar que la **Redirect URI** sea: `https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback.html`
3. Hacer clic en **"Autorizar con Gmail"**
4. Completar autorización en Google
5. Verificar que la ventana popup se cierre automáticamente

## 🔍 Verificación de Logs

### En la ventana popup (DevTools > Console):
```
🔄 [CALLBACK HTML] Iniciando procesamiento de callback...
📍 [CALLBACK HTML] URL actual: https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback.html?code=...
🪟 [CALLBACK HTML] Es ventana popup: true
🔍 [CALLBACK HTML] Código encontrado: Sí
✅ [CALLBACK HTML] Tokens obtenidos exitosamente
📤 [CALLBACK HTML] Enviando mensaje a ventana padre...
```

### En la ventana principal:
```
📨 Mensaje recibido: {type: 'GMAIL_AUTH_SUCCESS', ...}
✅ Autorización exitosa recibida
```

## 🚨 Solución Temporal

Si no puedes actualizar Google Cloud Console inmediatamente, he creado un archivo de redirección que maneja la URL antigua:

**Archivo**: `public/auth/callback`
- Redirige automáticamente a `callback.html`
- Maneja la URL con doble barra
- Funciona como solución temporal

## 📋 Checklist de Verificación

- [ ] Google Cloud Console actualizado con nueva URL
- [ ] URL antigua eliminada de Google Cloud Console
- [ ] Cambios guardados en Google Cloud Console
- [ ] Caché del navegador limpiado
- [ ] Configuración local verificada
- [ ] Autorización probada
- [ ] Logs verificados
- [ ] Ventana popup se cierra automáticamente
- [ ] Estado cambia a "Autorizado: Sí"

## 🎯 Resultado Esperado

Después de actualizar Google Cloud Console:

1. ✅ **URL de redirección actualizada** a `callback.html`
2. ✅ **Ventana popup carga página HTML estática**
3. ✅ **Callback se procesa correctamente**
4. ✅ **Tokens se intercambian exitosamente**
5. ✅ **Ventana popup se cierra automáticamente**
6. ✅ **Aplicación principal se actualiza**
7. ✅ **Estado cambia** de "Autorizando..." a "Autorizado: Sí"

## 🔧 Troubleshooting

### Si la URL sigue siendo la antigua:
1. Verificar que se guardaron los cambios en Google Cloud Console
2. Esperar unos minutos para que se propaguen los cambios
3. Limpiar caché del navegador
4. Probar en modo incógnito

### Si la autorización sigue fallando:
1. Verificar logs en la consola del navegador
2. Verificar que la nueva URL sea accesible
3. Verificar que no haya errores de CORS
4. Probar en diferentes navegadores

## 📞 Soporte

Si el problema persiste después de seguir estos pasos:

1. **Proporcionar captura de pantalla** de Google Cloud Console
2. **Proporcionar logs** de la consola del navegador
3. **Verificar** que la nueva URL sea accesible
4. **Confirmar** que los cambios se guardaron en Google Cloud Console

## 🎉 Conclusión

**El problema principal es que Google Cloud Console sigue usando la URL antigua.**

**Solución**: Actualizar la URI de redirección en Google Cloud Console a:
```
https://dbkoko-convertidor-imagenes.mvitku.easypanel.host/auth/callback.html
```

**Una vez actualizado, la autorización funcionará correctamente.**
