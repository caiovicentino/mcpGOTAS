/**
 * Servidor MCP básico para Smithery
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
app.use(cors());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Endpoint MCP para listar ferramentas
app.get('/mcp', (req, res) => {
  console.log('GET /mcp - Listando ferramentas');
  
  // Responder com a lista de ferramentas no formato JSON-RPC 2.0
  res.json({
    jsonrpc: "2.0",
    id: "1",
    result: {
      tools: tools
    }
  });
});

// Endpoint MCP para executar ferramentas
app.post('/mcp', (req, res) => {
  console.log('POST /mcp - Body:', JSON.stringify(req.body));
  
  // Responder com a lista de ferramentas no formato JSON-RPC 2.0
  res.json({
    jsonrpc: "2.0",
    id: req.body.id || "1",
    result: {
      tools: tools
    }
  });
});

// Endpoint MCP para encerrar sessão
app.delete('/mcp', (req, res) => {
  console.log('DELETE /mcp - Encerrando sessão');
  
  // Responder com sucesso no formato JSON-RPC 2.0
  res.json({
    jsonrpc: "2.0",
    id: "1",
    result: {
      success: true
    }
  });
});

// Rota raiz para verificação de saúde
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Basic MCP Server is running'
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Basic MCP Server running on port ${port}`);
  console.log(`MCP endpoint available at: http://localhost:${port}/mcp`);
});
