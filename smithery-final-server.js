/**
 * Servidor MCP ultra simples para Smithery
 * 
 * Este servidor implementa apenas o necessário para listar ferramentas
 * no formato JSON-RPC 2.0 exigido pelo Smithery, com resposta imediata.
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Definição das ferramentas
const tools = [
  {
    name: 'create-payment',
    description: 'Creates a new payment in the Gotas Commerce API',
    parameters: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'Payment amount'
        },
        currency: {
          type: 'string',
          description: 'Currency code'
        },
        return_url: {
          type: 'string',
          description: 'URL to redirect customer'
        }
      },
      required: ['amount', 'currency', 'return_url']
    }
  }
];

// Middleware para processar JSON
app.use(express.json());

// Middleware para CORS
app.use(cors());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Endpoint MCP para listar ferramentas
app.all('/mcp', (req, res) => {
  console.log('Requisição MCP recebida');
  
  // Responder imediatamente com a lista de ferramentas no formato JSON-RPC 2.0
  res.json({
    jsonrpc: "2.0",
    id: req.body?.id || req.query?.id || "1",
    result: {
      tools: tools
    }
  });
});

// Rota raiz para verificação de saúde
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Smithery Final Server is running'
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Smithery Final Server running on port ${port}`);
  console.log(`MCP endpoint available at: http://localhost:${port}/mcp`);
});
