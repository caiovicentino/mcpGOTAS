const { createServer } = require('@smithery/sdk');

// Criar servidor MCP
const server = createServer({
  name: 'Gotas Commerce',
  description: 'Cryptocurrency payment gateway for USDT transactions',
  lazyLoading: true
});

// Definir as ferramentas
server.tool({
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

server.tool({
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
server.listen(port, () => {
  console.log(`Gotas Commerce MCP Server running on port ${port}`);
});
