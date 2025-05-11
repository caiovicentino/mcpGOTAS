/**
 * Servidor MCP básico para Smithery (versão simplificada)
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

// Middleware básicos
app.use(express.json());
app.use(cors());

// Logging simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Rota raiz para healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint MCP - GET
app.get('/mcp', (req, res) => {
  res.json({
    jsonrpc: "2.0",
    id: req.query.id || null,
    result: {
      tools: tools
    }
  });
});

// Endpoint MCP - POST
app.post('/mcp', (req, res) => {
  // Responder sempre com a lista de ferramentas, independente da solicitação
  res.json({
    jsonrpc: "2.0",
    id: req.body?.id || null,
    result: {
      tools: tools
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
