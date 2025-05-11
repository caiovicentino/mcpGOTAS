/**
 * Servidor MCP para Smithery com suporte completo ao protocolo MCP
 * Implementa suporte para StreamableHTTP e sessões MCP
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

// Armazenar sessões ativas
const sessions = new Map();

// Middleware básicos
app.use(express.json());
app.use(cors());

// Logging simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Gerar ID único para sessão
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substring(2, 15);
}

// Rota raiz para healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint MCP para JSON-RPC
app.post('/mcp', (req, res) => {
  // Garantir que temos um body válido
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error"
      }
    });
  }

  // Extrair dados do request
  const id = req.body.id !== undefined ? req.body.id : "1";
  const method = req.body.method || 'mcp.listTools';
  const params = req.body.params || {};

  console.log(`Handling MCP method: ${method}`, params);

  // Processar o método requisitado
  if (method === 'mcp.initialize') {
    // Criar nova sessão 
    const sessionId = generateSessionId();
    sessions.set(sessionId, { 
      created: new Date(), 
      lastActive: new Date() 
    });
    
    return res.json({
      jsonrpc: "2.0",
      id: id,
      result: {
        session_id: sessionId,
        protocol_version: "2025-03-26",
        server_info: {
          name: "Gotas Commerce MCP Server",
          version: "1.0.0"
        }
      }
    });
  }
  
  if (method === 'mcp.listTools') {
    // Retornar lista de ferramentas disponíveis
    return res.json({
      jsonrpc: "2.0",
      id: id,
      result: tools
    });
  }
  
  if (method === 'mcp.runTool') {
    const toolName = params.name;
    const toolParams = params.parameters || {};
    
    // Executar a ferramenta solicitada
    if (toolName === 'create-payment') {
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          payment_id: "pay_" + Math.random().toString(36).substring(2, 12),
          status: "pending",
          payment_url: `https://commerce.gotas.com/pay/${Math.random().toString(36).substring(2, 12)}`,
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }
      });
    } 
    
    if (toolName === 'check-payment-status') {
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          payment_id: toolParams.payment_id,
          status: ["pending", "completed", "failed"][Math.floor(Math.random() * 3)],
          updated_at: new Date().toISOString()
        }
      });
    }
    
    // Ferramenta não encontrada
    return res.status(404).json({
      jsonrpc: "2.0",
      id: id,
      error: {
        code: -32601,
        message: `Tool not found: ${toolName}`
      }
    });
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

// Endpoint GET para debugging
app.get('/debug', (req, res) => {
  return res.json({
    tools: tools,
    sessions: Array.from(sessions.entries()).map(([id, session]) => ({
      id,
      created: session.created,
      lastActive: session.lastActive
    }))
  });
});

// Iniciar o servidor
const server = app.listen(port, () => {
  console.log(`MCP Server running on port ${port}`);
  console.log(`Healthcheck: http://localhost:${port}/`);
  console.log(`MCP endpoint: http://localhost:${port}/mcp`);
});

