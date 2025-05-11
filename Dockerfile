FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV PORT=3000
ENV NODE_ENV=production

# Adicionar healthcheck com intervalo maior para dar tempo ao servidor inicializar
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Comando para iniciar o servidor
CMD ["node", "basic-mcp-server.js"]
