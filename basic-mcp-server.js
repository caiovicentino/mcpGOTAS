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
  console.log('GET /mcp - Listando ferramentas - Query:', req.query);
  
  // Responder com a lista de ferramentas no formato JSON-RPC 2.0
  // A query parameter "method" pode ser utilizada para determinar o comportamento
  if (req.query.method === 'mcp.listTools' || !req.query.method) {
    return res.json({
      jsonrpc: "2.0",
      id: req.query.id || "1",
      result: {
        tools: tools
      }
    });
  } else {
    return res.status(400).json({
      jsonrpc: "2.0",
      id: req.query.id || "1",
      error: {
        code: -32601,
        message: `Method ${req.query.method} not found`
      }
    });
  }
});

// Endpoint MCP para executar ferramentas
app.post('/mcp', (req, res) => {
  console.log('POST /mcp - Body:', JSON.stringify(req.body));
  
  // Verificar se é uma solicitação de lista de ferramentas
  if (req.body.method === 'mcp.listTools') {
    return res.json({
      jsonrpc: "2.0",
      id: req.body.id || "1",
      result: {
        tools: tools
      }
    });
  }
  
  // Se for execução de ferramenta
  if (req.body.method === 'mcp.runTool') {
    const toolName = req.body.params?.name;
    const toolParams = req.body.params?.parameters || {};
    
    console.log(`Executing tool: ${toolName} with params:`, toolParams);
    
    // Simular execução de ferramenta (implementação real deve ser adicionada)
    if (toolName === 'create-payment') {
      return res.json({
        jsonrpc: "2.0",
        id: req.body.id || "1",
        result: {
          payment_id: "pay_" + Math.random().toString(36).substring(2, 12),
          status: "pending",
          payment_url: `https://commerce.gotas.com/pay/${Math.random().toString(36).substring(2, 12)}`,
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }
      });
    } else if (toolName === 'check-payment-status') {
      return res.json({
        jsonrpc: "2.0",
        id: req.body.id || "1",
        result: {
          payment_id: toolParams.payment_id,
          status: ["pending", "completed", "failed"][Math.floor(Math.random() * 3)],
          updated_at: new Date().toISOString()
        }
      });
    } else {
      return res.status(404).json({
        jsonrpc: "2.0",
        id: req.body.id || "1",
        error: {
          code: -32601,
          message: `Method ${toolName} not found`
        }
      });
    }
  }
  
  // Método não reconhecido
  return res.status(400).json({
    jsonrpc: "2.0",
    id: req.body.id || "1",
    error: {
      code: -32600,
      message: "Invalid request"
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

// Log de inicialização
console.log('Iniciando servidor MCP...');

// Iniciar o servidor imediatamente
const server = app.listen(port, () => {
  console.log(`Basic MCP Server running on port ${port}`);
  console.log(`MCP endpoint available at: http://localhost:${port}/mcp`);
  console.log('Server ready to handle requests');
});

// Configurar timeout para responder mais rapidamente
server.timeout = 30000; // 30 segundos

// Lidar com erros de servidor
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Processo para encerramento limpo
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
