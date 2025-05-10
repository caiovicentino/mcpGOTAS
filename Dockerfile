FROM node:16

WORKDIR /app

# Copiar package.json primeiro para aproveitar o cache do Docker
COPY package.json ./
COPY package-lock.json* ./

# Instalar dependências
RUN npm install

# Copiar o restante dos arquivos
COPY . .

# Expor porta
EXPOSE 3000

# Variável de ambiente para porta
ENV PORT=3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
