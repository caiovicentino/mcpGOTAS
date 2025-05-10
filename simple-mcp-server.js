/**
 * Servidor MCP simples para demonstrar o lazy loading
 *
 * Este servidor implementa apenas o necessário para listar ferramentas
 * sem autenticação e demonstrar o lazy loading para o Smithery.
 */

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Middleware para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Mcp-Session-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

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

  // Log detalhado para requisições ao endpoint MCP
  if (req.originalUrl.startsWith('/mcp')) {
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    if (req.method === 'POST') {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }

    if (req.query && Object.keys(req.query).length > 0) {
      console.log('Query:', JSON.stringify(req.query, null, 2));
    }
  }

  next();
});

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

// Endpoint MCP para listar ferramentas
app.get('/mcp', (req, res) => {
  if (req.query.action === 'list-tools') {
    // Implementação do lazy loading - listar ferramentas sem autenticação
    // Formato JSON-RPC 2.0
    return res.json({
      jsonrpc: "2.0",
      id: req.query.id || "1",
      result: {
        tools: tools
      }
    });
  }

  // Resposta padrão para o endpoint MCP
  res.json({
    jsonrpc: "2.0",
    id: "1",
    result: {
      name: 'Gotas Commerce',
      description: 'Cryptocurrency payment gateway for USDT transactions',
      version: '1.0.0'
    }
  });
});

// Endpoint MCP para executar ferramentas
app.post('/mcp', (req, res) => {
  // Extrair o ID da requisição para usar na resposta
  const requestId = req.body.id || "1";

  // Verificar se é uma requisição de listagem de ferramentas do Smithery
  if (req.body.method === 'list-tools' || req.body.action === 'list-tools' || !req.body.method) {
    // Implementação do lazy loading - listar ferramentas sem autenticação
    // Formato JSON-RPC 2.0
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

// Middleware para lidar com erros
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  // Extrair o ID da requisição para usar na resposta
  const requestId = (req.body && req.body.id) || (req.query && req.query.id) || "1";

  // Responder com erro no formato JSON-RPC 2.0
  res.status(500).json({
    jsonrpc: "2.0",
    id: requestId,
    error: {
      code: -32000,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      data: {
        type: 'internal_error'
      }
    }
  });
});

// Endpoint MCP para encerrar sessões
app.delete('/mcp', (req, res) => {
  // Extrair o ID da requisição para usar na resposta
  const requestId = req.query.id || "1";

  // Simplesmente responder com sucesso no formato JSON-RPC 2.0
  res.status(200).json({
    jsonrpc: "2.0",
    id: requestId,
    result: {
      success: true,
      message: 'Session closed successfully'
    }
  });
});

// Middleware para lidar com rotas não encontradas
app.use((req, res) => {
  // Extrair o ID da requisição para usar na resposta
  const requestId = (req.body && req.body.id) || (req.query && req.query.id) || "1";

  // Responder com erro no formato JSON-RPC 2.0
  res.status(404).json({
    jsonrpc: "2.0",
    id: requestId,
    error: {
      code: -32601,
      message: `The requested resource '${req.path}' was not found on this server`,
      data: {
        path: req.path
      }
    }
  });
});

// Iniciar o servidor
const server = app.listen(port, () => {
  console.log(`Simple MCP Server running on port ${port}`);
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
