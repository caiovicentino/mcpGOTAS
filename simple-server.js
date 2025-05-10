const { createServer } = require('@smithery/sdk');
const express = require('express');

// Criar servidor MCP
const mcpServer = createServer({
  name: 'Gotas Commerce',
  description: 'Cryptocurrency payment gateway for USDT transactions'
});

// Definir uma ferramenta simples
mcpServer.tool({
  name: 'hello-world',
  description: 'Returns a hello world message',
  parameters: {},
  handler: async () => {
    return "Hello from Gotas Commerce MCP Server!";
  }
});

// Iniciar o servidor HTTP
const port = process.env.PORT || 3000;
const app = express();

// Middleware básico
app.use(express.json());

// Montar o handler MCP no endpoint /mcp
const mcpHandler = mcpServer.createExpressHandler();
app.use('/mcp', mcpHandler);

// Rota raiz para verificação de saúde
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Gotas Commerce MCP Server is running'
  });
});

// Iniciar o servidor Express
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
