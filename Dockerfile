# Dockerfile para EasyPanel
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (necesitamos vite para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Configurar variables de entorno para producción
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Usar simple-server.js que incluye la API REST para persistencia de datos
CMD ["node", "simple-server.js"]
