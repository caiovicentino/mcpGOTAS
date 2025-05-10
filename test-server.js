/**
 * Script para testar o servidor MCP localmente
 *
 * Este script verifica se o servidor está configurado corretamente
 * para o Smithery, testando o endpoint /mcp e a listagem de ferramentas.
 * Também testa a configuração em base64 conforme especificação do Streamable HTTP.
 */

const http = require('http');

// Função para fazer uma requisição HTTP
function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
            rawData: data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Função para codificar em base64
function encodeBase64(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

// Função principal
async function main() {
  console.log('Testando o servidor MCP com Streamable HTTP...');

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
    console.log(`Resposta:`, rootResponse.data);

    // Testar o endpoint MCP
    console.log('\n2. Testando o endpoint MCP (/mcp)...');
    const mcpResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/mcp',
      method: 'GET'
    });

    console.log(`Status: ${mcpResponse.statusCode}`);
    if (mcpResponse.parseError) {
      console.log(`Erro ao analisar resposta: ${mcpResponse.parseError}`);
      console.log(`Resposta bruta (primeiros 200 caracteres): ${mcpResponse.rawData.substring(0, 200)}...`);
    } else {
      console.log(`Resposta:`, mcpResponse.data);
    }

    // Testar a listagem de ferramentas
    console.log('\n3. Testando a listagem de ferramentas...');
    const toolsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/mcp?action=list-tools',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log(`Status: ${toolsResponse.statusCode}`);
    if (toolsResponse.parseError) {
      console.log(`Erro ao analisar resposta: ${toolsResponse.parseError}`);
      console.log(`Resposta bruta (primeiros 200 caracteres): ${toolsResponse.rawData.substring(0, 200)}...`);
    } else {
      console.log(`Ferramentas disponíveis:`, toolsResponse.data);
    }

    // Testar com configuração em base64
    console.log('\n4. Testando com configuração em base64...');
    const config = {
      GOTAS_API_KEY: 'test-api-key',
      GOTAS_BASE_URL: 'https://test.commerce.gotas.com'
    };
    const encodedConfig = encodeBase64(config);

    const configResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/mcp?config=${encodedConfig}&action=list-tools`,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log(`Status: ${configResponse.statusCode}`);
    if (configResponse.parseError) {
      console.log(`Erro ao analisar resposta: ${configResponse.parseError}`);
      console.log(`Resposta bruta (primeiros 200 caracteres): ${configResponse.rawData.substring(0, 200)}...`);
    } else {
      console.log(`Resposta com configuração:`, configResponse.data);
    }

    console.log('\nTestes concluídos com sucesso!');

  } catch (error) {
    console.error('Erro ao testar o servidor:', error);
  }
}

// Executar o teste
main();
