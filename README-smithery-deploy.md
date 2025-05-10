# Instruções de Deploy no Smithery

Este documento contém instruções específicas para o deploy do servidor MCP da Gotas Commerce no Smithery.

## Pré-requisitos

- Conta no Smithery (https://smithery.ai)
- Repositório do projeto no GitHub
- Chave de API da Gotas Commerce

## Arquivos de Configuração

O projeto contém os seguintes arquivos de configuração para o Smithery:

- `smithery.yaml`: Configuração principal do Smithery
- `.smithery.json`: Configuração adicional do Smithery
- `Dockerfile`: Configuração do Docker para o build do servidor

## Lazy Loading

O servidor implementa o padrão de "lazy loading" conforme recomendado pelo Smithery. Isso significa que:

1. A listagem de ferramentas não requer autenticação
2. A autenticação com a API da Gotas Commerce só ocorre no momento da execução das ferramentas
3. As credenciais são verificadas apenas quando uma ferramenta é chamada, não durante a inicialização

## Passos para o Deploy

1. Faça login no Smithery (https://smithery.ai)
2. Adicione o servidor ao Smithery (ou reclame-o se já estiver listado)
3. Clique em "Deploy" na aba "Deployments" na página do servidor
4. O Smithery irá construir e implantar o servidor de acordo com a configuração do projeto

## Verificação do Deploy

Após o deploy, verifique se o servidor está funcionando corretamente:

1. Verifique se o servidor está listando as ferramentas corretamente
2. Teste a execução das ferramentas com uma chave de API válida

## Troubleshooting

Se o Smithery não conseguir escanear as ferramentas:

1. Verifique se o servidor está rodando corretamente
2. Confirme que o endpoint `/mcp` está acessível
3. Verifique se o parâmetro `lazyLoading: true` está definido nos arquivos de configuração
4. Certifique-se de que o servidor está usando a versão mais recente do SDK do Smithery

## Arquivos Importantes

- `simple-mcp-server.js`: Implementação simplificada do servidor MCP que garante o lazy loading
- `test-smithery.js`: Script para testar a integração com o Smithery

## Variáveis de Configuração

O servidor aceita as seguintes variáveis de configuração:

- `GOTAS_API_KEY` (obrigatória): Chave de API para autenticação com a Gotas Commerce
- `GOTAS_BASE_URL` (opcional): URL base da API da Gotas Commerce (padrão: https://commerce.gotas.com)

## Ferramentas Disponíveis

O servidor expõe as seguintes ferramentas:

1. `create-payment`: Cria um novo pagamento na API da Gotas Commerce
2. `check-payment-status`: Verifica o status de um pagamento existente
