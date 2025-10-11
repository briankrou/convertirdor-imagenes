import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      // Hosts de EasyPanel
      'dbkoko-convertidor-imagenes.mvitku.easypanel.host',
      'dbkoko-converter-img.mvitku.easypanel.host',
      '*.easypanel.host',
      '*.mvitku.easypanel.host',
      // Hosts genéricos para desarrollo
      '*.local',
      '*.dev'
    ]
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      // Hosts de EasyPanel
      'dbkoko-convertidor-imagenes.mvitku.easypanel.host',
      'dbkoko-converter-img.mvitku.easypanel.host',
      '*.easypanel.host',
      '*.mvitku.easypanel.host',
      // Hosts genéricos para desarrollo
      '*.local',
      '*.dev'
    ]
  }
});
