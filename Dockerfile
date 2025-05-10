FROM python:3.11-slim

WORKDIR /app

# Configurações para acelerar inicialização
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV MCP_LAZY_LOADING=1

# Copiar primeiro os requisitos para aproveitar o cache
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar apenas os arquivos necessários
COPY src ./src
COPY *.md ./

# Expor porta
EXPOSE 8000

# Comando simples para iniciar o servidor
CMD ["python", "-m", "src.gotas_mcp_server"]
