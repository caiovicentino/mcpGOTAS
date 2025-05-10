"""
Gotas Commerce MCP Server

Este servidor expõe ferramentas MCP para interagir com a API de pagamentos
da Gotas Commerce.
"""

import os
import json
import asyncio
from dotenv import load_dotenv
import httpx
from mcp.server.fastmcp import FastMCP
from fastapi import FastAPI

# Carregar variáveis de ambiente
load_dotenv()
GOTAS_API_KEY = os.getenv("GOTAS_API_KEY", "")
GOTAS_BASE_URL = os.getenv("GOTAS_BASE_URL", "https://commerce.gotas.com").rstrip("/")

# Criar servidor MCP 
mcp = FastMCP(name="GotasCommerce")

@mcp.tool(name="create-payment", description="Creates a new payment in the Gotas Commerce API")
async def create_payment(amount: float, currency: str, return_url: str, description: str = "") -> str:
    """
    Creates a payment with the provided details.
    
    Parameters:
      amount (float): Payment amount (e.g., 100.50).
      currency (str): Currency code (e.g., "USDT").
      return_url (str): URL to redirect customer after payment.
      description (str): Optional description or reference for the payment.
    """
    # Verificar credenciais somente na execução da ferramenta (lazy loading)
    api_key = os.getenv("GOTAS_API_KEY", GOTAS_API_KEY)
    base_url = os.getenv("GOTAS_BASE_URL", GOTAS_BASE_URL)
    
    if not api_key:
        return "Error: Gotas Commerce API key is not configured. Please configure GOTAS_API_KEY."
    
    url = f"{base_url}/api/v1/payments"
    headers = {"x-api-key": api_key, "Content-Type": "application/json", "Accept": "application/json"}
    
    # Preparar payload do pagamento
    payload = {
        "amount": str(amount),  # API espera valor como string
        "currency": currency,
        "return_url": return_url
    }
    
    if description:
        payload["description"] = description

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return json.dumps(response.json(), ensure_ascii=False, indent=2)
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        detail = e.response.text
        return f"Error creating payment: HTTP {status} - {detail}"
    except Exception as e:
        return f"Error creating payment: {str(e)}"


@mcp.tool(name="check-payment-status", description="Checks the status of an existing payment")
async def check_payment_status(payment_id: str) -> str:
    """
    Gets the status of a payment by its ID.
    
    Parameters:
      payment_id (str): Identifier of the payment to check.
    """
    # Verificar credenciais somente na execução da ferramenta (lazy loading)
    api_key = os.getenv("GOTAS_API_KEY", GOTAS_API_KEY)
    base_url = os.getenv("GOTAS_BASE_URL", GOTAS_BASE_URL)
    
    if not api_key:
        return "Error: Gotas Commerce API key is not configured. Please configure GOTAS_API_KEY."
    
    url = f"{base_url}/api/v1/payments/{payment_id}"
    headers = {"x-api-key": api_key, "Accept": "application/json"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return json.dumps(response.json(), ensure_ascii=False, indent=2)
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        detail = e.response.text
        return f"Error checking payment: HTTP {status} - {detail}"
    except Exception as e:
        return f"Error checking payment: {str(e)}"


# FastAPI app
app = FastAPI(title="Gotas Commerce MCP Server")
app.mount("/mcp", mcp.sse_app())

@app.get("/")
async def root():
    return {"message": "Gotas Commerce MCP Server is running"}


# Para execução direta
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
