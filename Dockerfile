FROM python:3.11-slim

WORKDIR /app

# Configurações de ambiente
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8000

# Copiar requisitos
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fonte
COPY src ./src

# Copiar configurações (se disponíveis)
COPY *.md ./

# Porta para FastAPI
EXPOSE 8000

# Comando de inicialização simplificado
CMD ["python", "-m", "uvicorn", "src.gotas_mcp_server:app", "--host", "0.0.0.0", "--port", "8000"]
