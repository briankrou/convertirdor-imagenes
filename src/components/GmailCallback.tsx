import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { gmailApiService } from '../services/gmailApiService';

interface GmailCallbackProps {
  onAuthSuccess: (accessToken: string, refreshToken: string) => void;
  onAuthError: (error: string) => void;
}

export const GmailCallback: React.FC<GmailCallbackProps> = ({
  onAuthSuccess,
  onAuthError
}) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando autorización...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener el código de autorización de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`Error de autorización: ${error}`);
        }

        if (!code) {
          throw new Error('No se recibió el código de autorización');
        }

        // Intercambiar el código por tokens
        const tokens = await gmailApiService.getTokensFromCode(code);
        
        setStatus('success');
        setMessage('Autorización exitosa! Cerrando ventana...');
        
        // Notificar al componente padre
        onAuthSuccess(tokens.accessToken, tokens.refreshToken);
        
        // Enviar mensaje a la ventana padre
        if (window.opener) {
          window.opener.postMessage({
            type: 'GMAIL_AUTH_SUCCESS',
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          }, window.location.origin);
        }
        
        // Cerrar la ventana después de un breve delay
        setTimeout(() => {
          window.close();
        }, 2000);

      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Error desconocido');
        
        // Notificar al componente padre
        onAuthError(error instanceof Error ? error.message : 'Error desconocido');
        
        // Enviar mensaje de error a la ventana padre
        if (window.opener) {
          window.opener.postMessage({
            type: 'GMAIL_AUTH_ERROR',
            error: error instanceof Error ? error.message : 'Error desconocido'
          }, window.location.origin);
        }
        
        // Cerrar la ventana después de un delay
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    handleCallback();
  }, [onAuthSuccess, onAuthError]);

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
      </div>
    </div>
  );
};
