FROM node:18-alpine

WORKDIR /app

# Inicializar projeto e instalar dependências
RUN npm init -y && \
    npm install express --save

# Copiar o servidor
COPY smithery-simple.js .

# Expor porta
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "smithery-simple.js"]
