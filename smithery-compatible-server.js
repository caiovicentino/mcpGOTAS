/**
 * Smithery-compatible MCP Server
 * 
 * This server implements the MCP Streamable HTTP transport protocol
 * according to the specification at:
 * https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http
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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Mcp-Session-Id', 'Origin', 'X-Requested-With']
}));

// Middleware para processar configuração em base64
app.use((req, res, next) => {
  if (req.query.config) {
    try {
      const configStr = Buffer.from(req.query.config, 'base64').toString('utf-8');
      req.smitheryConfig = JSON.parse(configStr);
      console.log('Smithery config detected and parsed successfully');
    } catch (error) {
      console.error('Error parsing Smithery config:', error);
    }
  } else {
    req.smitheryConfig = {};
  }
  next();
});

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Função para gerar um ID de requisição
function generateRequestId() {
  return Math.random().toString(36).substring(2, 15);
}

// Endpoint MCP principal (Streamable HTTP)
app.all('/mcp', (req, res) => {
  // Verificar se o cliente aceita JSON ou SSE
  const acceptsJson = req.headers.accept && req.headers.accept.includes('application/json');
  const acceptsSSE = req.headers.accept && req.headers.accept.includes('text/event-stream');
  
  // Extrair o ID da requisição
  const requestId = (req.body && req.body.id) || (req.query && req.query.id) || generateRequestId();
  
  // Método GET para SSE ou para listar ferramentas
  if (req.method === 'GET') {
    if (req.query.action === 'list-tools' || acceptsJson) {
      // Listar ferramentas via GET (para compatibilidade com Smithery)
      console.log('Listando ferramentas via GET');
      return res.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          tools: tools
        }
      });
    } else if (acceptsSSE) {
      // Configurar cabeçalhos para SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      
      // Manter a conexão viva
      const keepAlive = setInterval(() => {
        res.write(':\n\n'); // Comentário SSE para manter a conexão
      }, 30000);
      
      // Limpar quando a conexão for fechada
      req.on('close', () => {
        console.log('Conexão SSE fechada');
        clearInterval(keepAlive);
      });
      
      return;
    }
  }
  
  // Método POST para enviar mensagens JSON-RPC
  if (req.method === 'POST') {
    // Verificar se é uma requisição de listagem de ferramentas
    if (req.body.method === 'list-tools' || req.body.action === 'list-tools' || !req.body.method) {
      console.log('Listando ferramentas via POST');
      return res.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          tools: tools
        }
      });
    }
    
    // Para requisições de execução de ferramentas
    const method = req.body.method || req.body.tool;
    const params = req.body.params || req.body.arguments || {};
    
    // Verificar se a ferramenta existe
    const toolDef = tools.find(t => t.name === method);
    if (!toolDef) {
      return res.json({
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: -32601,
          message: `Method '${method}' not found`,
          data: {
            method: method
          }
        }
      });
    }
    
    // Lazy loading - verificar configuração apenas na execução
    const apiKey = process.env.GOTAS_API_KEY || req.smitheryConfig?.GOTAS_API_KEY;
    if (!apiKey) {
      return res.json({
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: -32000,
          message: "API key is required to execute tools",
          data: {
            method: method
          }
        }
      });
    }
    
    // Simular execução da ferramenta
    if (method === 'create-payment') {
      const { amount, currency, return_url, description } = params;
      return res.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          message: "Payment created successfully",
          details: {
            amount,
            currency,
            return_url,
            description,
            status: "pending",
            payment_url: `https://commerce.gotas.com/pay?session=example-id`,
            wallet_address: "0x79Dc4e370298e0ff2563972c2d4e8350a31Fe851",
          }
        }
      });
    }
    
    if (method === 'check-payment-status') {
      const { payment_id } = params;
      return res.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          id: payment_id,
          amount: "250.00",
          currency: "USDT",
          status: "pending",
          payment_url: `https://commerce.gotas.com/pay?session=${payment_id}`,
          wallet_address: "0x79Dc4e370298e0ff2563972c2d4e8350a31Fe851",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        }
      });
    }
    
    // Ferramenta não implementada
    return res.json({
      jsonrpc: "2.0",
      id: requestId,
      error: {
        code: -32000,
        message: `The method '${method}' is not implemented yet`,
        data: {
          method: method
        }
      }
    });
  }
  
  // Método DELETE para encerrar sessão
  if (req.method === 'DELETE') {
    console.log('Encerrando sessão');
    
    // Responder com sucesso
    return res.status(200).json({
      jsonrpc: "2.0",
      id: requestId,
      result: {
        success: true,
        message: 'Session closed successfully'
      }
    });
  }
  
  // Método OPTIONS para preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Método não suportado
  res.status(405).json({
    jsonrpc: "2.0",
    id: requestId,
    error: {
      code: -32601,
      message: "Method not allowed",
      data: {
        method: req.method
      }
    }
  });
});

// Rota raiz para verificação de saúde
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Gotas Commerce MCP Server is running',
    version: '1.0.0',
    protocol: 'MCP Streamable HTTP',
    endpoints: {
      mcp: '/mcp'
    }
  });
});

// Iniciar o servidor
const server = app.listen(port, () => {
  console.log(`Smithery-compatible MCP Server running on port ${port}`);
  console.log(`MCP endpoint available at: http://localhost:${port}/mcp`);
});

// Lidar com sinais de encerramento
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
