# Gotas Commerce API & MCP Integration

Este projeto implementa a integração com a API de pagamentos da Gotas Commerce, permitindo a criação e verificação de pagamentos em criptomoedas usando USDT. Também inclui uma implementação do servidor Model Context Protocol (MCP) para permitir que assistentes de IA como o Claude possam interagir com essa API.

## Demonstração

O projeto foi testado com sucesso e gerou um link de pagamento de 250 USDT:
- **Link de pagamento**: https://commerce.gotas.com/pay?session=10aa1636-fb39-4d1f-aed5-3be4ef073722
- **ID do pagamento**: 10aa1636-fb39-4d1f-aed5-3be4ef073722
- **Endereço da carteira**: 0x79Dc4e370298e0ff2563972c2d4e8350a31Fe851

## Recursos

- **Criação de Pagamentos**: Gera links de pagamento para transações em USDT
- **Verificação de Status**: Verifica o status atual dos pagamentos existentes
- **Integração MCP**: Compatível com o Claude e outros assistentes que suportam MCP
- **API Direta**: Scripts para interação direta com a API Gotas Commerce

## Configuração

### Pré-requisitos

- Python 3.8 ou superior
- Chave de API da Gotas Commerce

### Instalação

1. Clone este repositório

2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
   
   Ou execute o arquivo de configuração:
   ```bash
   .\setup.bat
   ```

3. As variáveis de ambiente já estão configuradas no arquivo `.env`:
   - `GOTAS_API_KEY`: c2d7163f021fd86ea4fcb56f2badbf4c1935a6337d1ca3d960e4fceead8715bb
   - `GOTAS_BASE_URL`: https://commerce.gotas.com

### Execução do Servidor MCP

```bash
uvicorn src.gotas_mcp_server:app --host 0.0.0.0 --port 8000
```

### Criação Direta de Pagamentos

Para criar um pagamento sem usar o servidor MCP, você pode usar o script `test_client.py`:

```bash
python test_client.py
```

Para verificar o status de um pagamento existente:

```bash
python check_payment.py
```

### Instalação no Claude Desktop

Para usar o MCP diretamente com o Claude Desktop:

```bash
python install_claude.py
```

Ou manualmente:

```bash
mcp install src.gotas_mcp_server.py
```

## Uso da API

### Endpoints da API Gotas Commerce

1. **Criar Pagamento**
   - `POST /api/v1/payments`
   - Parâmetros:
     - `amount`: Valor do pagamento (ex: "250.00")
     - `currency`: Código da moeda (ex: "USDT")
     - `return_url`: URL para redirecionamento após o pagamento
     - `description`: Descrição opcional do pagamento

2. **Verificar Status do Pagamento**
   - `GET /api/v1/payments/{payment_id}`

### Ferramentas MCP

1. **create-payment**
   - Cria um novo pagamento
   - Parâmetros:
     - `amount`: Valor do pagamento (ex: 250.00)
     - `currency`: Código da moeda (ex: "USDT")
     - `return_url`: URL para redirecionamento após o pagamento
     - `description`: Descrição opcional do pagamento

2. **check-payment-status**
   - Verifica o status de um pagamento existente
   - Parâmetros:
     - `payment_id`: ID do pagamento a ser verificado

## Estrutura do Projeto

- **`src/gotas_mcp_server.py`**: Implementação do servidor MCP
- **`test_client.py`**: Script para criar pagamentos diretamente
- **`check_payment.py`**: Script para verificar o status de pagamentos
- **`install_claude.py`**: Script para instalar o MCP no Claude Desktop
- **`.env`**: Arquivo de configuração com a chave de API
- **`docsdaapigotas.md`**: Documentação detalhada da API Gotas Commerce

## Documentação da API

Para informações mais detalhadas sobre a API da Gotas Commerce, consulte:
- [Documentação da API Gotas Commerce](https://commerce.gotas.com/developer)
- Veja também o arquivo `docsdaapigotas.md` neste repositório

## Suporte

Para suporte ou informações adicionais, entre em contato com a equipe de desenvolvimento da Gotas.
