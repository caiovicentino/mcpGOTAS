FROM node:18-slim

WORKDIR /app

# Copiar package.json primeiro para aproveitar o cache do Docker
COPY package.json ./
COPY package-lock.json* ./

# Instalar dependências e ferramentas necessárias
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    npm ci --only=production || npm install --production

# Copiar o restante dos arquivos
COPY . .

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV PORT=3000
ENV NODE_ENV=production

# Usuário não-root para segurança
USER node

# Verificação de saúde
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Comando para iniciar o servidor
CMD ["node", "server.js"]
