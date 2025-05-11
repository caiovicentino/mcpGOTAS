FROM node:18-alpine

WORKDIR /app

# Inicializar projeto e instalar dependências
RUN npm init -y && \
    npm install express cors --save

# Copiar o arquivo do servidor
COPY smithery-final-version.js .

# Expor porta
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "smithery-final-version.js"]
