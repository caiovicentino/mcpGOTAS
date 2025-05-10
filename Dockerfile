FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV PORT=3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
