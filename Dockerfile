FROM node:18-alpine

WORKDIR /app

# Inicializar projeto e instalar dependências
RUN npm init -y && \
    npm install express cors --save

# Copiar o arquivo package.json
COPY package.json .

# Instalar dependências
RUN npm install --production

# Copiar todos os arquivos
COPY . .

# Expor porta
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "ultra-minimal-server.js"]
