/**
 * Minimal MCP Server for Smithery
 * Implements bare minimum for Smithery tool scanning
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Define tool list
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

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Mcp-Session-Id']
}));

// Simple logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Healthcheck
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// MCP endpoint - GET
app.get('/mcp', (req, res) => {
  console.log('GET /mcp - Listando ferramentas');

  // Responder imediatamente com a lista de ferramentas
  return res.json({
    jsonrpc: "2.0",
    id: req.query.id || "1",
    result: {
      tools: tools,
      protocolVersion: "2025-03-26",
      serverInfo: {
        name: "Gotas Commerce MCP",
        version: "1.0.0"
      }
    }
  });
});

// MCP endpoint - POST
app.post('/mcp', (req, res) => {
  console.log('POST /mcp - Body:', JSON.stringify(req.body));
  const id = req.body.id || "1";

  // Responder imediatamente com a lista de ferramentas
  return res.json({
    jsonrpc: "2.0",
    id: id,
    result: {
      tools: tools,
      protocolVersion: "2025-03-26",
      serverInfo: {
        name: "Gotas Commerce MCP",
        version: "1.0.0"
      }
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

// Start server
app.listen(port, () => {
  console.log(`Minimal MCP Server running on port ${port}`);
  console.log(`MCP endpoint available at: http://localhost:${port}/mcp`);
});