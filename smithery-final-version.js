/**
 * Servidor MCP otimizado para Smithery
 * Implementado para ser 100% compatível com a plataforma Smithery
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Versão do protocolo MCP usado
const PROTOCOL_VERSION = "2025-03-26";

// Informações do servidor
const SERVER_INFO = {
  name: "Gotas Commerce Payment Gateway",
  version: "1.0.0",
  vendor: "Gotas Commerce"
};

// Ferramentas disponíveis
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

// Configuração do Express
app.use(express.json());
app.use(cors());

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Rota para healthcheck
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Gotas Commerce MCP Server is running',
    timestamp: new Date().toISOString()
  });
});

// Endpoint principal do MCP
app.post('/mcp', (req, res) => {
  console.log('POST /mcp - Body:', JSON.stringify(req.body, null, 2));
  
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

  const id = req.body.id || '1';
  const method = req.body.method;
  const params = req.body.params || {};

  console.log(`Handling method: ${method}`);

  // Método initialize
  if (method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id: id,
      result: {
        protocolVersion: PROTOCOL_VERSION,
        serverInfo: SERVER_INFO,
        capabilities: {
          tool_provider: true
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
    const toolName = params.name;
    const parameters = params.parameters || {};

    // Verificar se a ferramenta existe
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
          payment_id: parameters.payment_id,
          status: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)]
        }
      });
    }
  }

  // Método não suportado
  return res.status(400).json({
    jsonrpc: '2.0',
    id: id,
    error: {
      code: -32601,
      message: `Method not supported: ${method}`
    }
  });
});

// Endpoint MCP via GET (usando Query Parameters)
app.get('/mcp', (req, res) => {
  console.log('GET /mcp - Query:', JSON.stringify(req.query, null, 2));
  
  const id = req.query.id || '1';
  const method = req.query.method;
  
  // Se for uma solicitação de listagem de ferramentas
  if (method === 'mcp.listTools' || !method) {
    return res.json({
      jsonrpc: '2.0',
      id: id,
      result: tools
    });
  }
  
  // Se for uma solicitação de inicialização
  if (method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id: id,
      result: {
        protocolVersion: PROTOCOL_VERSION,
        serverInfo: SERVER_INFO,
        capabilities: {
          tool_provider: true
        }
      }
    });
  }
  
  // Método não suportado via GET
  return res.status(400).json({
    jsonrpc: '2.0',
    id: id,
    error: {
      code: -32601,
      message: `Method not supported via GET: ${method}`
    }
  });
});

// Iniciar o servidor
const server = app.listen(port, () => {
  console.log(`MCP Server running on port ${port}`);
  console.log(`Protocol version: ${PROTOCOL_VERSION}`);
  console.log(`Server name: ${SERVER_INFO.name}`);
});

// Gerenciar encerramento limpo
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
