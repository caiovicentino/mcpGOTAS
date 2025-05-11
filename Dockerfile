FROM node:18-alpine

WORKDIR /app

# Copiar apenas os arquivos necessários para instalar dependências
COPY package.json ./

# Instalar dependências, incluindo cors explicitamente
RUN npm install express cors || \
    (npm install && npm install express cors)

# Copiar o resto do código
COPY . .

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV PORT=3000
ENV NODE_ENV=production

# Healthcheck simples
HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Comando para iniciar o servidor simples
CMD ["node", "simple-smithery-mcp.js"]
