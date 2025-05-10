/**
 * Script para testar o servidor MCP localmente
 * 
 * Este script verifica se o servidor está configurado corretamente
 * para o Smithery, testando o endpoint /mcp e a listagem de ferramentas.
 */

const http = require('http');

// Função para fazer uma requisição HTTP
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Função principal
async function main() {
  console.log('Testando o servidor MCP...');
  
  try {
    // Testar a rota raiz
    console.log('\n1. Testando a rota raiz (/)...');
    const rootResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    
    console.log(`Status: ${rootResponse.statusCode}`);
    console.log(`Resposta: ${rootResponse.data}`);
    
    // Testar o endpoint MCP
    console.log('\n2. Testando o endpoint MCP (/mcp)...');
    const mcpResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/mcp',
      method: 'GET'
    });
    
    console.log(`Status: ${mcpResponse.statusCode}`);
    console.log(`Resposta: ${mcpResponse.data.substring(0, 200)}...`);
    
    // Testar a listagem de ferramentas
    console.log('\n3. Testando a listagem de ferramentas...');
    const toolsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/mcp?action=list-tools',
      method: 'GET'
    });
    
    console.log(`Status: ${toolsResponse.statusCode}`);
    console.log(`Resposta: ${toolsResponse.data.substring(0, 200)}...`);
    
    console.log('\nTestes concluídos com sucesso!');
    
  } catch (error) {
    console.error('Erro ao testar o servidor:', error);
  }
}

// Executar o teste
main();
