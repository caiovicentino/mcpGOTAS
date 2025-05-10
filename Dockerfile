FROM python:3.11-slim

WORKDIR /app

# Define build arguments for potential customization
ARG GOTAS_API_KEY=""
ARG GOTAS_BASE_URL="https://commerce.gotas.com"

# Set environment variables
ENV GOTAS_API_KEY=$GOTAS_API_KEY
ENV GOTAS_BASE_URL=$GOTAS_BASE_URL
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copiar apenas os arquivos necessários primeiro para aproveitar o cache do Docker
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código fonte
COPY src ./src
COPY *.md ./

# Copiar arquivo de configuração dotenv se existir (opcional)
COPY .env* ./

# Expor porta para HTTP (opcional, utilizado apenas se startCommand.type for "http")
EXPOSE 8000

# Comando padrão que será substituído pelo Smithery
CMD ["python", "-m", "src.gotas_mcp_server"]
