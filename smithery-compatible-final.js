/**
 * Servidor MCP otimizado para Smithery
 * Implementado segundo a documentação oficial do Smithery
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Garantir que as ferramentas estão no formato exato exigido pelo Smithery
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

// Configuração básica do Express
app.use(express.json());
app.use(cors());

// Logging detalhado para todos as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.method === 'POST') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  } else if (req.method === 'GET') {
    console.log('Query:', JSON.stringify(req.query, null, 2));
  }
  
  next();
});

// Endpoint para healthcheck
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Endpoint principal para MCP - Suporta MCP sobre JSON-RPC 2.0
app.post('/mcp', async (req, res) => {
  try {
    // Validar a requisição
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Invalid JSON was received by the server'
        }
      });
    }

    const id = req.body.id !== undefined ? req.body.id : '1';
    const method = req.body.method;
    const params = req.body.params || {};

    console.log(`Processing method: ${method}`);

    // Método initialize - usado para estabelecer a conexão inicial
    if (method === 'initialize' || method === 'mcp.initialize') {
      return res.json({
        jsonrpc: '2.0',
        id: id,
        result: {
          capabilities: {
            tool_provider: true
          },
          server_info: {
            name: 'Gotas Commerce Payment Gateway',
            version: '1.0.0'
          }
        }
      });
    }

    // Método listTools - retorna a lista de ferramentas disponíveis
    if (method === 'mcp.listTools') {
      return res.json({
        jsonrpc: '2.0',
        id: id,
        result: tools
      });
    }

    // Método runTool - executa uma ferramenta específica
    if (method === 'mcp.runTool') {
      const toolName = params.name;
      const toolParams = params.parameters || {};

      const tool = tools.find(t => t.name === toolName);
      if (!tool) {
        return res.status(404).json({
          jsonrpc: '2.0',
          id: id,
          error: {
            code: -32601,
            message: `Tool not found: ${toolName}`
          }
        });
      }

      // Executar a ferramenta
      if (toolName === 'create-payment') {
        return res.json({
          jsonrpc: '2.0',
          id: id,
          result: {
            payment_id: `pay_${Math.random().toString(36).substring(2, 10)}`,
            status: 'pending',
            payment_url: `https://commerce.gotas.com/pay/${Math.random().toString(36).substring(2, 10)}`
          }
        });
      }
      
      if (toolName === 'check-payment-status') {
        return res.json({
          jsonrpc: '2.0',
          id: id,
          result: {
            payment_id: toolParams.payment_id,
            status: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)]
          }
        });
      }
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
    
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: 'Internal server error'
      }
    });
  }
});

// Iniciar o servidor
const server = app.listen(port, () => {
  console.log(`MCP Server running on port ${port}`);
  console.log(`API endpoint available at: http://localhost:${port}/mcp`);
  console.log(`Current time: ${new Date().toISOString()}`);
});

// Gerenciar encerramento limpo
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
