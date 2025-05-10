"""
Gotas Commerce MCP Server

This server exposes Model Context Protocol (MCP) tools for interacting with
the Gotas Commerce payment API. It allows creating payments and checking payment status.

Usage:
    1. Install dependencies: pip install mcp[cli] fastapi uvicorn httpx python-dotenv
    2. Set environment variables (GOTAS_API_KEY, GOTAS_BASE_URL) in .env file
    3. Run the server: uvicorn src.gotas_mcp_server:app --reload --port 8000
    4. Or run with MCP CLI: mcp run src.gotas_mcp_server.py --transport streamable-http --host 0.0.0.0 --port 8000
"""

import os
import json
from dotenv import load_dotenv
import httpx
from mcp.server.fastmcp import FastMCP
from fastapi import FastAPI

# Load environment variables from .env file
load_dotenv()
GOTAS_API_KEY = os.getenv("GOTAS_API_KEY", "c2d7163f021fd86ea4fcb56f2badbf4c1935a6337d1ca3d960e4fceead8715bb")
GOTAS_BASE_URL = os.getenv("GOTAS_BASE_URL", "https://commerce.gotas.com").rstrip("/")

# Validate essential environment variables
if not GOTAS_API_KEY:
    raise RuntimeError("Environment variable 'GOTAS_API_KEY' is not defined.")
if not GOTAS_BASE_URL:
    raise RuntimeError("Environment variable 'GOTAS_BASE_URL' is not defined.")

# Create FastMCP server
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
    url = f"{GOTAS_BASE_URL}/api/v1/payments"
    headers = {"x-api-key": GOTAS_API_KEY, "Content-Type": "application/json", "Accept": "application/json"}
    
    # Prepare payment payload
    payload = {
        "amount": str(amount),  # API expects amount as string
        "currency": currency,
        "return_url": return_url
    }
    
    if description:
        payload["description"] = description

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            # Return formatted JSON response as text
            return json.dumps(response.json(), ensure_ascii=False, indent=2)
        except httpx.HTTPStatusError as e:
            # HTTP error from API
            status = e.response.status_code
            detail = e.response.text
            return f"Error creating payment: HTTP {status} - {detail}"
        except Exception as e:
            # Other error (connection, timeout, etc.)
            return f"Error creating payment: {str(e)}"


@mcp.tool(name="check-payment-status", description="Checks the status of an existing payment")
async def check_payment_status(payment_id: str) -> str:
    """
    Gets the status of a payment by its ID.
    
    Parameters:
      payment_id (str): Identifier of the payment to check.
    """
    url = f"{GOTAS_BASE_URL}/api/v1/payments/{payment_id}"
    headers = {"x-api-key": GOTAS_API_KEY, "Accept": "application/json"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return json.dumps(response.json(), ensure_ascii=False, indent=2)
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            detail = e.response.text
            return f"Error checking payment: HTTP {status} - {detail}"
        except Exception as e:
            return f"Error checking payment: {str(e)}"


@mcp.prompt(name="create-payment-prompt", description="Guides the user to provide data for creating a new payment")
def prompt_create_payment() -> str:
    """
    Prompt to guide the user on what data to provide for creating a payment.
    """
    return (
        "To create a new payment, please provide the following information:\n"
        "- Amount (e.g., 100.50)\n"
        "- Currency (e.g., USDT)\n"
        "- Return URL (where the customer will be redirected after payment)\n"
        "- Description (optional): A brief description of what the payment is for\n\n"
        "For example: {'amount': 100.50, 'currency': 'USDT', 'return_url': 'https://yoursite.com/thank-you', 'description': 'Test payment'}"
    )


@mcp.resource("payment-status://{payment_id}")
async def get_payment_status_resource(payment_id: str) -> str:
    """
    Get payment status as an MCP resource.
    
    Parameters:
      payment_id (str): The payment ID to check.
    """
    url = f"{GOTAS_BASE_URL}/api/v1/payments/{payment_id}"
    headers = {"x-api-key": GOTAS_API_KEY, "Accept": "application/json"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            payment_data = response.json()
            # Return a formatted summary of the payment status
            return (
                f"Payment ID: {payment_data.get('id')}\n"
                f"Status: {payment_data.get('status')}\n"
                f"Amount: {payment_data.get('amount')} {payment_data.get('currency')}\n"
                f"Created: {payment_data.get('created_at')}\n"
                f"Expires: {payment_data.get('expires_at')}\n"
                f"Description: {payment_data.get('description', 'N/A')}"
            )
        except Exception as e:
            return f"Error retrieving payment status: {str(e)}"


# Create FastAPI app and mount MCP server on /mcp route
app = FastAPI(title="Gotas Commerce MCP Server")
app.mount("/mcp", mcp.sse_app())  # Usando sse_app em vez de streamable_http_app

# Simple health check endpoint
@app.get("/")
async def root():
    return {"message": "Gotas Commerce MCP Server is running"}


# Allow running the app directly with Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
