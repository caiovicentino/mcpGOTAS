/**
 * Servidor MCP básico para Smithery (compatível com JSON-RPC)
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

// Middleware básicos
app.use(express.json());
app.use(cors());

// Logging simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Rota raiz para healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint MCP - GET
app.get('/mcp', (req, res) => {
  // Validar e sanitizar o parâmetro ID
  const id = req.query.id || '1'; // Default to '1' if no ID provided

  // Verificar se é uma requisição de inicialização ou listagem de ferramentas
  if (req.query.method === 'initialize') {
    return res.json({
      jsonrpc: "2.0",
      id: id,
      result: {
        name: "Gotas Commerce",
        description: "Cryptocurrency payment gateway for USDT transactions",
        tools: tools,
        version: "1.0.0"
      }
    });
  }

  // Resposta padrão para scan de ferramentas
  res.json({
    jsonrpc: "2.0",
    id: id,
    result: {
      tools: tools
    }
  });
});

// Endpoint MCP - POST
app.post('/mcp', (req, res) => {
  // Sanitizar o ID para garantir que seja uma string ou número válido
  const id = req.body && req.body.id !== undefined ? req.body.id : '1';
  
  // Obter método da requisição ou usar o padrão
  const method = req.body && req.body.method ? req.body.method : 'mcp.listTools';
  
  if (method === 'initialize' || method === 'mcp.initialize') {
    // Resposta para inicialização
    return res.json({
      jsonrpc: "2.0",
      id: id,
      result: {
        name: "Gotas Commerce",
        description: "Cryptocurrency payment gateway for USDT transactions",
        tools: tools,
        version: "1.0.0"
      }
    });
  }

  if (method === 'mcp.listTools') {
    // Resposta para listar ferramentas
    return res.json({
      jsonrpc: "2.0",
      id: id,
      result: tools
    });
  }

  if (method === 'mcp.runTool') {
    const params = req.body && req.body.params ? req.body.params : {};
    const toolName = params.name;
    
    if (toolName === 'create-payment') {
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          payment_id: "pay_" + Math.random().toString(36).substring(2, 12),
          status: "pending"
        }
      });
    }
    
    if (toolName === 'check-payment-status') {
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          status: "pending"
        }
      });
    }
    
    // Ferramenta não encontrada
    return res.json({
      jsonrpc: "2.0",
      id: id,
      error: {
        code: -32601,
        message: `Method not found: ${toolName}`
      }
    });
  }
  
  // Método não suportado
  return res.json({
    jsonrpc: "2.0",
    id: id,
    error: {
      code: -32601,
      message: `Method not supported: ${method}`
    }
  });
});

// Endpoint MCP - DELETE
app.delete('/mcp', (req, res) => {
  res.json({
    jsonrpc: "2.0",
    id: "1",
    result: true
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

