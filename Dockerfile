# Dockerfile para EasyPanel
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

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

# Comando de inicio
CMD ["npm", "start"]
