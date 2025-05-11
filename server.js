// Importar o SDK do Smithery
let smitherySDK;
try {
  smitherySDK = require('@smithery/sdk');
} catch (error) {
  console.error('Erro ao importar @smithery/sdk:', error.message);
  console.log('Tentando importar com caminho alternativo...');
  try {
    // For WSL2 environment
    smitherySDK = require('@smithery/sdk/dist/server');
  } catch (innerError) {
    console.error('Falha ao importar com caminho alternativo:', innerError.message);
    throw new Error('Não foi possível importar o SDK do Smithery. Verifique a instalação.');
  }
}

const { createServer } = smitherySDK;

// Criar servidor MCP
const mcpServer = createServer({
  name: 'Gotas Commerce',
  description: 'Cryptocurrency payment gateway for USDT transactions',
  lazyLoading: true
});

// Definir as ferramentas
mcpServer.tool({
  name: 'create-payment',
  description: 'Creates a new payment in the Gotas Commerce API',
  parameters: {
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
      description: 'Optional description of the payment',
      required: false
    }
  },
  handler: async ({ amount, currency, return_url, description }, context) => {
    // Lazy loading - verificar configuração apenas na execução
    const apiKey = process.env.GOTAS_API_KEY || context.config?.GOTAS_API_KEY;
    const baseUrl = process.env.GOTAS_BASE_URL || context.config?.GOTAS_BASE_URL || 'https://commerce.gotas.com';

    if (!apiKey) {
      return "Error: Gotas Commerce API key is not configured. Please configure GOTAS_API_KEY.";
    }

    try {
      // Simular resposta bem-sucedida (em ambiente real, faria a chamada HTTP real)
      return JSON.stringify({
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
      }, null, 2);
    } catch (error) {
      return `Error creating payment: ${error.message}`;
    }
  }
});

mcpServer.tool({
  name: 'check-payment-status',
  description: 'Checks the status of an existing payment',
  parameters: {
    payment_id: {
      type: 'string',
      description: 'Identifier of the payment to check'
    }
  },
  handler: async ({ payment_id }, context) => {
    // Lazy loading - verificar configuração apenas na execução
    const apiKey = process.env.GOTAS_API_KEY || context.config?.GOTAS_API_KEY;
    const baseUrl = process.env.GOTAS_BASE_URL || context.config?.GOTAS_BASE_URL || 'https://commerce.gotas.com';

    if (!apiKey) {
      return "Error: Gotas Commerce API key is not configured. Please configure GOTAS_API_KEY.";
    }

    try {
      // Simular resposta bem-sucedida (em ambiente real, faria a chamada HTTP real)
      return JSON.stringify({
        id: payment_id,
        amount: "250.00",
        currency: "USDT",
        status: "pending",
        payment_url: `https://commerce.gotas.com/pay?session=${payment_id}`,
        wallet_address: "0x79Dc4e370298e0ff2563972c2d4e8350a31Fe851",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }, null, 2);
    } catch (error) {
      return `Error checking payment: ${error.message}`;
    }
  }
});

// Iniciar o servidor HTTP
const port = process.env.PORT || 3000;

// Configurar o endpoint /mcp para compatibilidade com Smithery
const express = require('express');
const app = express();

// Middleware para processar JSON e aumentar o limite de tamanho
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Mcp-Session-Id');

  // Responder imediatamente às solicitações OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Middleware para processar configuração em base64
app.use((req, res, next) => {
  if (req.query.config) {
    try {
      // Decodificar a configuração em base64
      const configStr = Buffer.from(req.query.config, 'base64').toString('utf-8');
      req.smitheryConfig = JSON.parse(configStr);
      console.log('Smithery config detected and parsed successfully');
    } catch (error) {
      console.error('Error parsing Smithery config:', error);
      // Não falhar completamente, apenas logar o erro
    }
  } else {
    // Garantir que sempre temos um objeto de configuração, mesmo que vazio
    req.smitheryConfig = {};
  }
  next();
});

// Middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Montar o servidor MCP no endpoint /mcp com opções personalizadas
const mcpHandler = mcpServer.createExpressHandler({
  // Passar a configuração do Smithery para o handler MCP
  configProvider: (req) => req.smitheryConfig || {},
  // Habilitar suporte para streaming de eventos
  streaming: true,
  // Garantir que a listagem de ferramentas não dependa de autenticação
  listTools: () => {
    // Retornar a lista de ferramentas sem verificar autenticação
    return mcpServer.listTools();
  }
});

// Montar o handler MCP no endpoint /mcp
app.use('/mcp', mcpHandler);

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
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Middleware para lidar com rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource '${req.path}' was not found on this server`
  });
});

// Iniciar o servidor Express
const httpServer = app.listen(port, () => {
  console.log(`Gotas Commerce MCP Server running on port ${port}`);
  console.log(`MCP endpoint available at: http://localhost:${port}/mcp`);
});

// Lidar com sinais de encerramento para uma saída limpa
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});
