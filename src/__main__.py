"""
Ponto de entrada principal para o servidor MCP Gotas Commerce

Este módulo permite iniciar o servidor MCP diretamente executando:
python -m src
"""

import os
import sys

# Configurar modo lazy loading
os.environ["MCP_LAZY_LOADING"] = "1"
os.environ["PYTHONUNBUFFERED"] = "1"

# Importar e iniciar o servidor
from src.gotas_mcp_server import app

if __name__ == "__main__":
    import uvicorn
    
    # Configurar variáveis de ambiente do sistema
    port = int(os.environ.get("PORT", "8000"))
    
    # Iniciar servidor com configurações para resposta rápida
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        log_level="info",
        timeout_keep_alive=120
    )
