# Gotas Commerce MCP Server - Smithery Integration

Este documento contém instruções específicas para a integração do servidor MCP da Gotas Commerce com o Smithery.

## Configuração do Lazy Loading

O servidor implementa o padrão de "lazy loading" conforme recomendado pelo Smithery. Isso significa que:

1. A listagem de ferramentas não requer autenticação
2. A autenticação com a API da Gotas Commerce só ocorre no momento da execução das ferramentas
3. As credenciais são verificadas apenas quando uma ferramenta é chamada, não durante a inicialização

## Variáveis de Configuração

O servidor aceita as seguintes variáveis de configuração:

- `GOTAS_API_KEY` (obrigatória): Chave de API para autenticação com a Gotas Commerce
- `GOTAS_BASE_URL` (opcional): URL base da API da Gotas Commerce (padrão: https://commerce.gotas.com)

## Ferramentas Disponíveis

O servidor expõe as seguintes ferramentas:

1. `create-payment`: Cria um novo pagamento na API da Gotas Commerce
2. `check-payment-status`: Verifica o status de um pagamento existente

## Troubleshooting

Se o Smithery não conseguir escanear as ferramentas:

1. Verifique se o servidor está rodando corretamente
2. Confirme que o endpoint `/mcp` está acessível
3. Verifique se o parâmetro `lazyLoading: true` está definido no arquivo `.smithery.json`
4. Certifique-se de que o servidor está usando a versão mais recente do SDK do Smithery
