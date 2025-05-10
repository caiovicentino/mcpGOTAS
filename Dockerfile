FROM node:16

WORKDIR /app

# Copiar todos os arquivos
COPY . .

# Instalar dependências
RUN npm install

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV PORT=3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
