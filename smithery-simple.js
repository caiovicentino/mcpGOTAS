/**
 * Servidor MCP extremamente simples para Smithery
 */

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Middleware para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Mcp-Session-Id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Definição das ferramentas
const tools = [
  {
    name: 'create-payment',
    description: 'Creates a new payment',
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

// Endpoint MCP
app.all('/mcp', (req, res) => {
  // Responder com a lista de ferramentas
  return res.json({
    jsonrpc: "2.0",
    id: req.body?.id || req.query?.id || "1",
    result: {
      tools: tools
    }
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Simple MCP Server is running'
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Simple MCP Server running on port ${port}`);
});
