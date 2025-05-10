FROM node:18-alpine

WORKDIR /app

# Copiar package.json primeiro para aproveitar o cache do Docker
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar o restante dos arquivos
COPY . .

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV PORT=3000
ENV NODE_ENV=production

# Comando para iniciar o servidor
CMD ["node", "server.js"]
