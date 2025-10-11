import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { gmailApiService } from '../services/gmailApiService';

export const GmailCallbackPopup: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando autorización...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 [POPUP] Procesando callback de Gmail API...');
        console.log('📍 [POPUP] URL actual:', window.location.href);
        console.log('🪟 [POPUP] Es ventana popup:', window.opener !== null);
        
        // Obtener el código de autorización de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        console.log('🔍 [POPUP] Código encontrado:', code ? 'Sí' : 'No');
        console.log('❌ [POPUP] Error encontrado:', error || 'No');

        if (error) {
          throw new Error(`Error de autorización: ${error}`);
        }

        if (!code) {
          throw new Error('No se recibió el código de autorización');
        }

        console.log('🔄 [POPUP] Intercambiando código por tokens...');
        
        // Intercambiar el código por tokens
        const tokens = await gmailApiService.getTokensFromCode(code);
        
        console.log('✅ [POPUP] Tokens obtenidos exitosamente');
        
        setStatus('success');
        setMessage('Autorización exitosa! Cerrando ventana...');
        
        // Enviar mensaje a la ventana padre
        if (window.opener && !window.opener.closed) {
          console.log('📤 [POPUP] Enviando mensaje a ventana padre...');
          window.opener.postMessage({
            type: 'GMAIL_AUTH_SUCCESS',
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          }, window.location.origin);
        } else {
          console.log('⚠️ [POPUP] No hay ventana padre o está cerrada');
        }
        
        // Cerrar la ventana después de un breve delay
        setTimeout(() => {
          console.log('🚪 [POPUP] Cerrando ventana...');
          window.close();
        }, 2000);

      } catch (error) {
        console.error('❌ [POPUP] Error en callback:', error);
        
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Error desconocido');
        
        // Enviar mensaje de error a la ventana padre
        if (window.opener && !window.opener.closed) {
          console.log('📤 [POPUP] Enviando mensaje de error a ventana padre...');
          window.opener.postMessage({
            type: 'GMAIL_AUTH_ERROR',
            error: error instanceof Error ? error.message : 'Error desconocido'
          }, window.location.origin);
        }
        
        // Cerrar la ventana después de un delay
        setTimeout(() => {
          console.log('🚪 [POPUP] Cerrando ventana por error...');
          window.close();
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'loading' && 'Autorizando...'}
          {status === 'success' && '¡Autorización Exitosa!'}
          {status === 'error' && 'Error de Autorización'}
        </h2>
        
        <p className={`text-lg ${
          status === 'loading' ? 'text-gray-600' :
          status === 'success' ? 'text-green-600' :
          'text-red-600'
        }`}>
          {message}
        </p>
        
        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Si el problema persiste, verifica que la URL de redirección esté configurada correctamente en Google Cloud Console.
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              La ventana se cerrará automáticamente. Ya puedes usar Gmail API para enviar emails.
            </p>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Debug Info:</strong><br/>
            URL: {window.location.href}<br/>
            Es popup: {window.opener !== null ? 'Sí' : 'No'}
          </p>
        </div>
      </div>
    </div>
  );
};
