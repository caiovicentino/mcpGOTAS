/**
 * Smithery Compatible MCP Server
 * Strictly following Smithery's expected response format
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Define our tools exactly as Smithery expects them
const tools = [
  {
    type: 'function',
    function: {
      name: 'create-payment',
      description: 'Creates a new payment in the Gotas Commerce API',
      inputSchema: {
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
    }
  },
  {
    type: 'function',
    function: {
      name: 'check-payment-status',
      description: 'Checks the status of an existing payment',
      inputSchema: {
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
  }
];

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
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

// MCP endpoint - GET with query parameters
app.get('/mcp', (req, res) => {
  // Handle initialize method
  if (req.query.method === 'initialize') {
    return res.json({
      jsonrpc: "2.0",
      id: req.query.id || "1",
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "Gotas Commerce",
          version: "1.0.0"
        },
        capabilities: {
          toolExecution: true
        },
        tools: tools
      }
    });
  }
  
  // Handle tools/list
  if (req.query.method === 'tools/list') {
    return res.json({
      jsonrpc: "2.0",
      id: req.query.id || "1",
      result: {
        tools: tools
      }
    });
  }
  
  // Default response with tools list
  return res.json({
    jsonrpc: "2.0",
    id: req.query.id || "1",
    result: {
      tools: tools
    }
  });
});

// MCP endpoint - POST with JSON body
app.post('/mcp', (req, res) => {
  const id = req.body.id || "1";
  const method = req.body.method || "";
  
  // Handle initialize
  if (method === 'initialize') {
    return res.json({
      jsonrpc: "2.0",
      id: id,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "Gotas Commerce",
          version: "1.0.0"
        },
        capabilities: {
          toolExecution: true
        },
        tools: tools
      }
    });
  }
  
  // Handle tools/list
  if (method === 'tools/list') {
    return res.json({
      jsonrpc: "2.0",
      id: id,
      result: {
        tools: tools
      }
    });
  }
  
  // Handle tool execution
  if (method === 'tools/run') {
    const params = req.body.params || {};
    const toolName = params.name;
    const toolArgs = params.input || {};
    
    if (toolName === 'create-payment') {
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          payment_id: "pay_" + Math.random().toString(36).substring(2, 12),
          status: "pending",
          amount: toolArgs.amount,
          currency: toolArgs.currency,
          payment_url: `https://commerce.gotas.com/pay?id=pay_${Math.random().toString(36).substring(2, 12)}`,
          created_at: new Date().toISOString()
        }
      });
    }
    
    if (toolName === 'check-payment-status') {
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          payment_id: toolArgs.payment_id || "pay_default",
          status: "pending",
          amount: 100,
          currency: "USDT",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        }
      });
    }
    
    // Tool not found
    return res.json({
      jsonrpc: "2.0",
      id: id,
      error: {
        code: -32601,
        message: `Tool not found: ${toolName}`
      }
    });
  }
  
  // Method not supported
  return res.json({
    jsonrpc: "2.0",
    id: id,
    error: {
      code: -32601,
      message: `Method not supported: ${method}`
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Smithery Compatible MCP Server running on port ${port}`);
  console.log(`Access healthcheck at: http://localhost:${port}/`);
  console.log(`Access MCP endpoint at: http://localhost:${port}/mcp`);
});