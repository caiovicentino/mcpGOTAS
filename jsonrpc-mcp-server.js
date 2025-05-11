/**
 * Servidor MCP com formato JSON-RPC 2.0 para Smithery
 * 
 * Este servidor implementa apenas o necessário para listar ferramentas
 * no formato JSON-RPC 2.0 exigido pelo Smithery.
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
          description: 'Payment amount (e.g., 100.50)'
        },
        currency: {
          type: 'string',
          description: 'Currency code (e.g., "USDT")'
        },
        return_url: {
          type: 'string',
          description: 'URL to redirect customer after payment'
        },
        description: {
          type: 'string',
          description: 'Optional description of the payment'
        }
      },
      required: ['amount', 'currency', 'return_url']
    }
  },
  {
    name: 'check-payment-status',
    description: 'Checks the status of an existing payment',
    parameters: {
      type: 'object',
      properties: {
        payment_id: {
          type: 'string',
          description: 'Identifier of the payment to check'
        }
      },
      required: ['payment_id']
    }
  }
];

// Middleware para processar JSON
app.use(express.json());

// Middleware para CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Mcp-Session-Id', 'Origin', 'X-Requested-With']
}));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Endpoint para listar ferramentas - responde a qualquer método
app.all('/mcp', (req, res) => {
  console.log('Requisição recebida em /mcp:', {
    method: req.method,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  
  // Responder com a lista de ferramentas no formato JSON-RPC 2.0
  res.json({
    jsonrpc: "2.0",
    id: "1",
    result: {
      tools: tools
    }
  });
});

// Endpoint específico para listar ferramentas
app.all('/mcp/list-tools', (req, res) => {
  console.log('Requisição recebida em /mcp/list-tools');
  
  // Responder com a lista de ferramentas no formato JSON-RPC 2.0
  res.json({
    jsonrpc: "2.0",
    id: "1",
    result: {
      tools: tools
    }
  });
});

// Rota raiz para verificação de saúde
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Gotas Commerce MCP Server is running',
    version: '1.0.0'
  });
});

// Iniciar o servidor
const server = app.listen(port, () => {
  console.log(`JSON-RPC MCP Server running on port ${port}`);
  console.log(`MCP endpoint available at: http://localhost:${port}/mcp`);
});

// Lidar com sinais de encerramento
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
