// Simple MCP server that doesn't rely on Smithery SDK
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Tools definitions
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

// MCP endpoint handler
app.post('/mcp', (req, res) => {
  console.log('Received MCP request:', JSON.stringify(req.body, null, 2));
  
  const { id, method, params } = req.body;
  
  if (method === 'list_tools') {
    // Handle tool listing
    return res.json({
      id,
      result: tools,
      jsonrpc: '2.0'
    });
  } 
  else if (method === 'run_tool') {
    const toolName = params?.tool_name;
    const toolParams = params?.parameters || {};
    
    // Process tool execution based on name
    if (toolName === 'create-payment') {
      return res.json({
        id,
        result: {
          message: "Payment created successfully",
          details: {
            amount: toolParams.amount,
            currency: toolParams.currency,
            return_url: toolParams.return_url,
            description: toolParams.description,
            status: "pending",
            payment_url: `https://commerce.gotas.com/pay?session=example-id`,
            wallet_address: "0x79Dc4e370298e0ff2563972c2d4e8350a31Fe851",
          }
        },
        jsonrpc: '2.0'
      });
    }
    else if (toolName === 'check-payment-status') {
      return res.json({
        id,
        result: {
          id: toolParams.payment_id,
          amount: "250.00",
          currency: "USDT",
          status: "pending",
          payment_url: `https://commerce.gotas.com/pay?session=${toolParams.payment_id}`,
          wallet_address: "0x79Dc4e370298e0ff2563972c2d4e8350a31Fe851",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
        jsonrpc: '2.0'
      });
    }
    else {
      return res.status(400).json({
        id,
        error: {
          code: -32601,
          message: `Unknown tool: ${toolName}`
        },
        jsonrpc: '2.0'
      });
    }
  }
  else {
    // Unknown method
    return res.status(400).json({
      id,
      error: {
        code: -32601,
        message: `Unknown method: ${method}`
      },
      jsonrpc: '2.0'
    });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Gotas Commerce MCP Server is running',
    version: '1.0.0',
    protocol: 'MCP JSON-RPC'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Simplified MCP Server running on port ${port}`);
  console.log(`MCP endpoint available at: http://localhost:${port}/mcp`);
});