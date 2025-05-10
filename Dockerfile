FROM python:3.11-slim

WORKDIR /app

# Configurações de ambiente para otimização
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copiar requisitos primeiro (para aproveitar cache do Docker)
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fonte
COPY src ./src

# Variáveis para debug e logs
ENV DEBUG=false
ENV LOG_LEVEL=info

# Porta para FastAPI
EXPOSE 8000

# Comando com verificação explícita de inicialização rápida
CMD ["python", "-c", "import sys; from src.gotas_mcp_server import app; import uvicorn; print('Starting MCP server with lazy loading of configurations...', file=sys.stderr); uvicorn.run(app, host='0.0.0.0', port=8000, log_level='info')"]
