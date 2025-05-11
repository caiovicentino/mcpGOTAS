/**
 * Servidor MCP básico para Smithery
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Ferramentas básicas formatadas conforme a especificação do MCP
const tools = [
  {
    name: 'create-payment',
    description: 'Creates a new payment in the Gotas Commerce API',
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number'
        },
        currency: {
          type: 'string'
        },
        return_url: {
          type: 'string'
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
          type: 'string'
        }
      },
      required: ['payment_id']
    }
  }
];

// Configurar middleware
app.use(express.json());
app.use(cors());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Rota raiz para healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint MCP principal
app.post('/mcp', (req, res) => {
  console.log('Recebida requisição POST /mcp:', JSON.stringify(req.body));
  
  // Verificar se a requisição é válida
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Parse error'
      }
    });
  }

  // Obter o ID e método
  const id = req.body.id !== undefined ? req.body.id : '1';
  const method = req.body.method;
  
  console.log(`Processando método: ${method}`);

  // Método initialize (handshake)
  if (method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id: id,
      result: {
        capabilities: {
          tools_provider: true
        },
        server_info: {
          name: 'Gotas Payment MCP',
          version: '1.0.0'
        }
      }
    });
  }
  
  // Método mcp.listTools
  if (method === 'mcp.listTools') {
    return res.json({
      jsonrpc: '2.0',
      id: id,
      result: tools
    });
  }
  
  // Método mcp.runTool
  if (method === 'mcp.runTool') {
    const toolName = req.body.params?.name;
    const parameters = req.body.params?.parameters || {};
    
    if (toolName === 'create-payment') {
      return res.json({
        jsonrpc: '2.0',
        id: id,
        result: {
          payment_id: 'pay_' + Math.random().toString(36).substring(2, 10),
          status: 'pending'
        }
      });
    }
    
    if (toolName === 'check-payment-status') {
      return res.json({
        jsonrpc: '2.0',
        id: id,
        result: {
          payment_id: parameters.payment_id,
          status: 'pending'
        }
      });
    }
    
    return res.status(404).json({
      jsonrpc: '2.0',
      id: id,
      error: {
        code: -32601,
        message: `Tool not found: ${toolName}`
      }
    });
  }
  
  // Método não reconhecido
  return res.status(400).json({
    jsonrpc: '2.0',
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
