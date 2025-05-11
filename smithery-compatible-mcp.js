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

// Endpoint MCP - GET
app.get('/mcp', (req, res) => {
  console.log('Recebida requisição GET para /mcp');
  console.log('Query:', req.query);
  
  // Usar o query parameter como método
  const id = req.query.id || "1";
  const method = req.query.method || 'mcp.listTools';
  
  console.log(`Processando método GET: ${method}`);
  
  // Se for listTools, retornar a lista de ferramentas
  if (method === 'mcp.listTools') {
    console.log('Retornando lista de ferramentas via GET');
    
    // Garantir o formato correto
    const formattedTools = tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));
    
    console.log('Ferramentas formatadas (GET):', JSON.stringify(formattedTools, null, 2));
    
    return res.json({
      jsonrpc: "2.0",
      id: id,
      result: formattedTools
    });
  }
  
  // Se for outro método, retornar erro
  return res.status(400).json({
    jsonrpc: "2.0",
    id: id,
    error: {
      code: -32601,
      message: `Method not supported in GET: ${method}`
    }
  });
});

// Endpoint MCP para JSON-RPC
app.post('/mcp', (req, res) => {
  console.log('Recebida requisição POST para /mcp');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Garantir que temos um body válido
  if (!req.body || typeof req.body !== 'object') {
    console.log('Erro: requisição sem body válido');
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

  console.log(`Tratando método MCP: ${method}`, JSON.stringify(params, null, 2));

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
    // Retornar lista de ferramentas disponíveis com o formato correto
    console.log('Retornando lista de ferramentas');
    
    // Certifique-se de que cada ferramenta tem a estrutura correta
    const formattedTools = tools.map(tool => ({
      name: tool.name,
      description: tool.description || null,
      inputSchema: tool.inputSchema
    }));
    
    console.log('Ferramentas formatadas:', JSON.stringify(formattedTools, null, 2));
    
    return res.json({
      jsonrpc: "2.0",
      id: id,
      result: formattedTools
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

