FROM node:20-slim

WORKDIR /app

# Copiar os arquivos
COPY . .

# Instalar dependências
RUN npm init -y && \
    npm install @smithery/sdk@latest

# Expor porta
EXPOSE 3000

# Variável de ambiente para porta
ENV PORT=3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
