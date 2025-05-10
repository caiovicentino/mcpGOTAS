import asyncio
import httpx
import json

async def check_status():
    payment_id = '10aa1636-fb39-4d1f-aed5-3be4ef073722'
    api_key = 'c2d7163f021fd86ea4fcb56f2badbf4c1935a6337d1ca3d960e4fceead8715bb'
    headers = {'x-api-key': api_key, 'Accept': 'application/json'}
    
    print(f'Verificando status do pagamento {payment_id}...')
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f'https://commerce.gotas.com/api/v1/payments/{payment_id}', headers=headers)
        result = response.json()
        print(f'Status: {result.get("status")}')
        print(json.dumps(result, indent=2))
    
    return result

if __name__ == '__main__':
    asyncio.run(check_status())
