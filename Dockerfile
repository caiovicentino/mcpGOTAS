FROM node:18-alpine

WORKDIR /app

# Instalar dependências
RUN npm init -y && \
    npm install express cors

# Copiar apenas o necessário
COPY basic-mcp-server-final.js .

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV PORT=3000

# Comando para iniciar o servidor
CMD ["node", "basic-mcp-server-final.js"]
