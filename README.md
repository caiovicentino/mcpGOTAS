# Gotas Commerce API & MCP Integration

Uma solução robusta para integração de pagamentos em criptomoeda usando o protocolo MCP (Model Context Protocol), permitindo que assistentes de IA como Claude possam criar e verificar transações USDT através da API Gotas Commerce.

## 🚀 Visão Geral

Este projeto fornece uma ponte entre assistentes de IA e serviços de pagamento em criptomoeda. Com o servidor MCP implementado, assistentes podem gerar links de pagamento, verificar status de transações e obter informações detalhadas sobre pagamentos USDT sem necessidade de conhecimento técnico especializado em blockchain.

## ✨ Recursos

### Ferramentas MCP

#### `create-payment`
Cria uma nova transação de pagamento em USDT e retorna todos os detalhes necessários, incluindo URL para pagamento e endereço da carteira.

**Parâmetros:**
- `amount`: Valor do pagamento (ex: 100.50)
- `currency`: Código da moeda (atualmente apenas "USDT")
- `return_url`: URL para redirecionamento do cliente após o pagamento
- `description`: Descrição opcional do pagamento

**Retorno:**
- Objeto JSON completo com todos os detalhes do pagamento:
  - ID único do pagamento
  - URL para pagamento
  - Endereço da carteira
  - Status (pending, completed, failed, expired)
  - Datas de criação e expiração
  - Outros metadados relevantes

#### `check-payment-status`
Verifica o status atual de um pagamento existente através de seu identificador único.

**Parâmetros:**
- `payment_id`: ID único do pagamento a ser verificado

**Retorno:**
- Objeto JSON completo com o estado atual do pagamento
- Informações de timestamp para criação, expiração e conclusão (quando aplicável)
- Hash da transação blockchain (quando o pagamento for confirmado)

### Recursos MCP

#### `payment-status://{payment_id}`
Fornece uma versão formatada e simplificada do status do pagamento como um recurso MCP.

**Retorno:**
- Texto formatado com as informações mais relevantes do pagamento
- Identificador, status, valor, timestamps e descrição

### Prompts MCP

#### `create-payment-prompt`
Um prompt guiado para auxiliar o usuário a fornecer as informações necessárias para criar um novo pagamento.

## 🔧 Arquitetura

O servidor MCP atua como uma camada de abstração sobre a API Gotas Commerce, traduzindo as capacidades da API em ferramentas, recursos e prompts facilmente utilizáveis por assistentes de IA como o Claude.

```
┌────────────────┐    ┌───────────────┐    ┌──────────────────┐
│                │    │               │    │                  │
│  Assistente IA ├────┤  Servidor MCP ├────┤  API Gotas       │
│  (Claude)      │    │  (FastAPI)    │    │  Commerce        │
│                │    │               │    │                  │
└────────────────┘    └───────────────┘    └──────────────────┘
```

## 📋 Pré-requisitos

- Python 3.8 ou superior
- Chave de API da Gotas Commerce (obtenha em: [commerce.gotas.com](https://commerce.gotas.com))
- Acesso a um assistente compatível com MCP (como Claude)

## 🔌 Instalação

1. Clone este repositório:
   ```bash
   git clone https://github.com/caiovicentino/mcpGOTAS.git
   cd mcpGOTAS
   ```

2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
   
   Ou use o script de configuração automatizado:
   ```bash
   ./setup.bat
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` com os seguintes valores:
     ```
     GOTAS_API_KEY=sua_chave_api_aqui
     GOTAS_BASE_URL=https://commerce.gotas.com
     ```

## 🏃‍♂️ Execução

### Servidor MCP

Execute o servidor para disponibilizar as ferramentas via MCP:

```bash
uvicorn src.gotas_mcp_server:app --host 0.0.0.0 --port 8000
```

### Integração com Claude Desktop

Para usar diretamente com o Claude Desktop:

```bash
python install_claude.py
```

Alternativamente, instale manualmente:

```bash
mcp install src.gotas_mcp_server.py
```

### Uso Direto da API (Scripts de Teste)

Para testes diretos sem um assistente:

- **Criar pagamento**: `python test_client.py`
- **Verificar status**: `python check_payment.py`

## 📊 Fluxo de Pagamento

1. **Inicialização do Pagamento**:
   - O assistente obtém do usuário o valor e outros detalhes do pagamento
   - O assistente chama a ferramenta `create-payment` com os parâmetros necessários
   - Um novo pagamento é criado na Gotas Commerce
   - O link de pagamento é retornado ao usuário

2. **Processo de Pagamento**:
   - O usuário acessa o link de pagamento fornecido
   - O usuário transfere USDT para o endereço de carteira exibido
   - A Gotas Commerce monitora a blockchain para confirmar a transação

3. **Verificação de Status**:
   - O assistente pode verificar o status do pagamento chamando `check-payment-status`
   - O status pode ser: pending (pendente), completed (concluído), expired (expirado) ou failed (falhou)
   - Quando o pagamento é confirmado, o hash da transação blockchain é disponibilizado

## 🔍 Especificações Técnicas

### Detalhes da API

**Endpoints da API Gotas Commerce**:

1. **Criar Pagamento**
   - `POST /api/v1/payments`
   - Corpo da requisição:
     ```json
     {
       "amount": "100.00",
       "currency": "USDT",
       "return_url": "https://exemplo.com/retorno",
       "description": "Descrição do pagamento"
     }
     ```

2. **Verificar Status do Pagamento**
   - `GET /api/v1/payments/{payment_id}`

### Comunicação MCP

- **Transporte**: SSE (Server-Sent Events)
- **Formato**: JSON para comunicação entre assistente e servidor MCP
- **Autenticação**: Chave de API armazenada como variável de ambiente

## 📂 Estrutura do Projeto

```
├── src/
│   └── gotas_mcp_server.py  # Implementação principal do servidor MCP
├── .env                     # Variáveis de ambiente (API key, etc.)
├── .smithery.json           # Configuração para Smithery CLI
├── check_payment.py         # Utilitário para verificar status de pagamentos
├── docsdaapigotas.md        # Documentação detalhada da API
├── install_claude.py        # Script para instalação no Claude Desktop
├── mcp.md                   # Documentação do servidor MCP
├── MCPPROTOCOLpython.MD     # Documentação do protocolo MCP em Python
├── requirements.txt         # Dependências do projeto
├── setup.bat                # Script de configuração para Windows
├── smithery.json            # Schema para integração com Smithery
└── test_client.py           # Cliente de teste para criação de pagamentos
```

## 🔒 Segurança

- A chave de API é armazenada como variável de ambiente, não no código-fonte
- Comunicação com a API da Gotas Commerce é feita via HTTPS
- O servidor MCP valida todos os parâmetros antes de enviar para a API
- Tratamento de erros adequado para evitar exposição de informações sensíveis

## 🧩 Extensibilidade

O projeto foi projetado para ser facilmente extensível:

1. **Novas Funcionalidades**: Adicione novas ferramentas MCP implementando funções decoradas com `@mcp.tool()` no servidor
2. **Integração com Outros Serviços**: A arquitetura permite integrar facilmente outros serviços além da Gotas Commerce
3. **Suporte a Novas Moedas**: A estrutura está preparada para suportar outras criptomoedas além de USDT no futuro

## 📚 Exemplos de Uso

### Criando um Pagamento (via Claude)

```
Usuário: Preciso gerar um link de pagamento de 50 USDT.

Claude: Vou gerar um link de pagamento para você. Para qual URL devo configurar o redirecionamento após o pagamento?

Usuário: https://meusite.com.br/obrigado

Claude: [Utilizando ferramenta create-payment]
Criando pagamento de 50 USDT com redirecionamento para https://meusite.com.br/obrigado...

Pronto! Criei um link de pagamento para 50 USDT.

Link de pagamento: [URL gerado pela API]
Este link expirará em 30 minutos. O cliente deve transferir exatamente 50 USDT para o endereço da carteira mostrado na página de pagamento.
```

### Verificando Status (via Claude)

```
Usuário: Verifique o status do meu pagamento com ID xyz123.

Claude: [Utilizando ferramenta check-payment-status]
Verificando o status do pagamento ID xyz123...

O status atual do pagamento é: PENDENTE
- Valor: 50.00 USDT
- Criado em: [timestamp]
- Expira em: [timestamp]

O pagamento ainda não foi confirmado na blockchain. Você pode acompanhar usando o link de pagamento ou me pedir para verificar novamente mais tarde.
```

## 📞 Suporte e Contato

Para suporte ou informações adicionais, entre em contato com a equipe de desenvolvimento da Gotas ou abra uma issue no repositório GitHub.

## 📜 Licença

[MIT License](LICENSE)
