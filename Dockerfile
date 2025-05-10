FROM node:20-slim

WORKDIR /app

# Copiar package.json primeiro para aproveitar o cache do Docker
COPY package.json ./
COPY package-lock.json* ./

# Instalar dependências
RUN npm install || (npm init -y && npm install @smithery/sdk@latest)

# Copiar o restante dos arquivos
COPY . .

# Expor porta
EXPOSE 3000

# Variável de ambiente para porta
ENV PORT=3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
