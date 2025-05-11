/**
 * Servidor MCP simplificado para Smithery
 * Implementa o formato exato esperado pelo Smithery para a validação das ferramentas
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Ferramentas formatadas de acordo com a especificação oficial do MCP
const tools = [
  {
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
  },
  {
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
];

// Configuração do Express
app.use(express.json());
app.use(cors());

// Endpoint de healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint MCP - Protocolo JSON-RPC 2.0
app.post('/mcp', (req, res) => {
  console.log('POST /mcp - Request Body:', JSON.stringify(req.body));
  
  if (!req.body || !req.body.method) {
    return res.status(400).json({
      jsonrpc: "2.0",
      id: req.body?.id || "1",
      error: {
        code: -32600,
        message: "Invalid request"
      }
    });
  }
  
  const method = req.body.method;
  const id = req.body.id || "1";
  
  // Lista de ferramentas
  if (method === 'mcp.listTools') {
    console.log('Retornando lista de ferramentas');
    return res.json({
      jsonrpc: "2.0",
      id: id,
      result: tools
    });
  }
  
  // Executar ferramenta
  if (method === 'mcp.runTool') {
    const toolName = req.body.params?.name;
    const toolParams = req.body.params?.parameters || {};
    
    // Simular execução da ferramenta
    if (toolName === 'create-payment') {
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          payment_id: "pay_" + Math.random().toString(36).substring(2, 12),
          status: "pending",
          payment_url: `https://commerce.gotas.com/pay/${Math.random().toString(36).substring(2, 12)}`
        }
      });
    } else if (toolName === 'check-payment-status') {
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          payment_id: toolParams.payment_id,
          status: ["pending", "completed", "failed"][Math.floor(Math.random() * 3)]
        }
      });
    } else {
      return res.status(404).json({
        jsonrpc: "2.0",
        id: id,
        error: {
          code: -32601,
          message: `Tool not found: ${toolName}`
        }
      });
    }
  }
  
  // Método não suportado
  return res.status(400).json({
    jsonrpc: "2.0",
    id: id,
    error: {
      code: -32601,
      message: `Method not supported: ${method}`
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`MCP Server running on port ${port}`);
});
