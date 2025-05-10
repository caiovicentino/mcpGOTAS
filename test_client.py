"""
Simple test client for the Gotas Commerce MCP server.

This script demonstrates how to connect to the MCP server, list available tools,
and make calls to create payments and check their status.

Usage:
    1. Start the MCP server first: mcp run src.gotas_mcp_server.py
    2. Run this test client: python test_client.py
"""

import asyncio
from mcp.client.session import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client


async def main():
    # Use HTTPx para se conectar ao servidor MCP que já está em execução
    import httpx
    
    print("Criando um pagamento de 250 USDT via API direta...")
    
    # Dados do pagamento
    payment_data = {
        "amount": "250.00",
        "currency": "USDT",
        "return_url": "https://example.com/return",
        "description": "Payment of 250 USDT via direct API call"
    }
    
    # Enviando a requisição diretamente para a API do Gotas Commerce
    api_key = "c2d7163f021fd86ea4fcb56f2badbf4c1935a6337d1ca3d960e4fceead8715bb"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        # Fazer a chamada direta à API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://commerce.gotas.com/api/v1/payments",
                json=payment_data,
                headers=headers,
                timeout=10.0
            )
            
            response.raise_for_status()
            result = response.json()
            print("\nPagamento criado com sucesso!")
            print(f"ID do pagamento: {result.get('id')}")
            print(f"Status: {result.get('status')}")
            print(f"URL de pagamento: {result.get('payment_url')}")
            print(f"Endereço da carteira: {result.get('wallet_address')}")
            print(f"Valor: {result.get('amount')} {result.get('currency')}")
            print(f"Expira em: {result.get('expires_at')}")
            
            # Retorna os detalhes completos formatados
            import json
            print("\nDetalhes completos do pagamento:")
            print(json.dumps(result, indent=2))
            
            return result
            
    except httpx.HTTPStatusError as e:
        print(f"Erro HTTP: {e.response.status_code} - {e.response.text}")
        return None
    except Exception as e:
        print(f"Erro ao criar pagamento: {str(e)}")
        return None
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            print("Connected to server!")
            
            # List available tools
            tools = await session.list_tools()
            print("\nAvailable tools:")
            for tool in tools:
                print(f"- {tool.name}: {tool.description}")
            
            # List available prompts
            prompts = await session.list_prompts()
            print("\nAvailable prompts:")
            for prompt in prompts:
                print(f"- {prompt.name}: {prompt.description}")
            
            # List available resources
            resources = await session.list_resources()
            print("\nAvailable resources:")
            for resource in resources:
                print(f"- {resource.name}: {resource.description}")
            
            # Create a test payment
            print("\nCreating a test payment of 250 USDT...")
            payment_result = await session.call_tool(
                "create-payment", 
                {
                    "amount": 250.00,
                    "currency": "USDT",
                    "return_url": "https://example.com/return",
                    "description": "Payment of 250 USDT via MCP"
                }
            )
            print(f"Payment creation result:\n{payment_result}")
            
            # Extract payment ID from result (for demonstration)
            try:
                payment_data = asyncio.run(extract_payment_id(payment_result))
                if payment_data.get("id"):
                    # Check payment status
                    print(f"\nChecking status of payment {payment_data['id']}...")
                    status_result = await session.call_tool(
                        "check-payment-status", 
                        {"payment_id": payment_data["id"]}
                    )
                    print(f"Payment status result:\n{status_result}")
                    
                    # Try to access the payment resource
                    print(f"\nRetrieving payment resource...")
                    try:
                        resource_content, mime_type = await session.read_resource(
                            f"payment-status://{payment_data['id']}"
                        )
                        print(f"Resource content ({mime_type}):\n{resource_content.decode('utf-8')}")
                    except Exception as e:
                        print(f"Error accessing resource: {str(e)}")
            except Exception as e:
                print(f"Could not extract payment ID: {str(e)}")


async def extract_payment_id(payment_result):
    """Extract payment ID from the JSON result string."""
    import json
    try:
        return json.loads(payment_result)
    except json.JSONDecodeError:
        print("Failed to parse payment result as JSON")
        return {}


if __name__ == "__main__":
    asyncio.run(main())
