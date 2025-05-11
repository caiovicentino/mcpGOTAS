FROM node:18-alpine

WORKDIR /app

# Inicializar projeto e instalar dependências
RUN npm init -y && \
    npm install express cors --save

# Copiar apenas o arquivo do servidor
COPY smithery-compatible-final.js .

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV PORT=3000

# Comando para iniciar o servidor
CMD ["node", "smithery-compatible-final.js"]
