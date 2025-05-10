# server.py - Servidor MCP para Gotas Commerce
#
# Dependências: mcp[cli], fastapi, uvicorn, httpx, python-dotenv
#
# Este servidor expõe ferramentas MCP para criar pagamentos e verificar status
# usando a API da Gotas Commerce, via transporte HTTP (streamable-http) em FastAPI.

import os
import json
from dotenv import load_dotenv
import httpx
from mcp.server.fastmcp import FastMCP
from fastapi import FastAPI

# Carrega variáveis de ambiente do arquivo .env (por exemplo, GOTAS_API_KEY e GOTAS_BASE_URL)
load_dotenv()
GOTAS_API_KEY = os.getenv("GOTAS_API_KEY")
GOTAS_BASE_URL = os.getenv("GOTAS_BASE_URL", "").rstrip("/")

# Valida as variáveis de ambiente essenciais
if not GOTAS_API_KEY:
    raise RuntimeError("Variável de ambiente 'GOTAS_API_KEY' não está definida.")
if not GOTAS_BASE_URL:
    raise RuntimeError("Variável de ambiente 'GOTAS_BASE_URL' não está definida.")

# Instancia o servidor FastMCP (stateless HTTP recomendado para transporte via rede)
mcp = FastMCP(name="GotasCommerce", stateless_http=True)

@mcp.tool(name="criar-pagamento", description="Cria um novo pagamento na API da Gotas Commerce")
async def criar_pagamento(valor: float, moeda: str, descricao: str = "") -> str:
    """
    Cria um pagamento com os dados informados.
    Parâmetros:
      valor (float): Valor do pagamento (por exemplo, 100.50).
      moeda (str): Código da moeda (por exemplo, "BRL").
      descricao (str): Descrição ou referência do pagamento.
    """
    url = f"{GOTAS_BASE_URL}/api/v1/payments"
    headers = {"x-api-key": GOTAS_API_KEY, "Accept": "application/json"}
    # Monta o payload do pagamento
    payload = {
        "amount": valor,
        "currency": moeda
    }
    if descricao:
        payload["description"] = descricao

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            # Retorna o JSON da resposta como texto formatado
            return json.dumps(response.json(), ensure_ascii=False)
        except httpx.HTTPStatusError as e:
            # Erro HTTP da API
            status = e.response.status_code
            detail = e.response.text
            return f"Erro ao criar pagamento: HTTP {status} - {detail}"
        except Exception as e:
            # Outro erro (conexão, timeout, etc.)
            return f"Erro ao criar pagamento: {str(e)}"

@mcp.tool(name="verificar-status", description="Verifica o status de um pagamento existente")
async def verificar_status(id_pagamento: str) -> str:
    """
    Obtém o status de um pagamento pelo seu ID.
    Parâmetros:
      id_pagamento (str): Identificador do pagamento a ser consultado.
    """
    url = f"{GOTAS_BASE_URL}/api/v1/payments/{id_pagamento}"
    headers = {"x-api-key": GOTAS_API_KEY, "Accept": "application/json"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return json.dumps(response.json(), ensure_ascii=False)
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            detail = e.response.text
            return f"Erro ao verificar pagamento: HTTP {status} - {detail}"
        except Exception as e:
            return f"Erro ao verificar pagamento: {str(e)}"

@mcp.prompt(name="criar-pagamento", description="Solicita dados para criar um novo pagamento no Gotas Commerce")
def prompt_criar_pagamento() -> str:
    """
    Prompt para orientar o usuário sobre quais dados fornecer para criar um pagamento.
    """
    return (
        "Para criar um novo pagamento, forneça os seguintes dados: "
        "valor (por exemplo, 100.50), moeda (ex: BRL) e uma descrição opcional. "
        "Exemplo de resposta em JSON: {\"valor\": 100.50, \"moeda\": \"BRL\", \"descricao\": \"Pagamento de teste\"}."
    )

# Cria o aplicativo FastAPI e monta o servidor MCP na rota /mcp
app = FastAPI(title="Servidor MCP - Gotas Commerce")
app.mount("/mcp", mcp.streamable_http_app())

# Rota de saúde simples (opcional)
@app.get("/")
async def raiz():
    return {"mensagem": "Servidor MCP do Gotas Commerce rodando"}

# Permite rodar o app com Uvicorn ao executar este script diretamente
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
Instruções de Execução
Dependências: instale usando pip install mcp[cli] fastapi uvicorn httpx python-dotenv.
Variáveis de Ambiente: crie um arquivo .env ou configure no ambiente:
GOTAS_API_KEY: sua chave de API fornecida pelo Gotas Commerce.
GOTAS_BASE_URL: URL base da API (por exemplo, https://commerce.gotas.com).
Executando o servidor:
Via FastAPI: execute uvicorn server:app --reload --port 8000.
Ou via CLI do MCP: mcp run server.py --transport streamable-http --host 0.0.0.0 --port 8000.
Após iniciado, o servidor estará disponível e pronto para receber chamadas MCP nas ferramentas criar-pagamento e verificar-status, retornando as respostas da API da Gotas Commerce ou mensagens de erro amigáveis.