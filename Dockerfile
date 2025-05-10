FROM python:3.11-slim

WORKDIR /app

# Copiar apenas os arquivos necessários primeiro para aproveitar o cache do Docker
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o resto do código
COPY . .

# Comando para iniciar o servidor (será substituído pelo Smithery)
CMD ["python", "-m", "src.gotas_mcp_server"]
