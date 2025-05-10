/**
 * Script para testar a integração com o Smithery
 *
 * Este script testa especificamente a funcionalidade de lazy loading
 * e a capacidade do servidor de listar ferramentas sem autenticação.
 */

const http = require('http');
const fs = require('fs');

// Verificar se o servidor está rodando
try {
  const response = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 1000
  }, () => {
    console.log('Servidor está rodando em http://localhost:3000');
  }).on('error', () => {
    console.log('Servidor não está rodando. Iniciando...');
    require('./simple-mcp-server.js');
  });

  response.end();
} catch (error) {
  console.error('Erro ao verificar o servidor:', error);
}

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
  console.log('Testando a integração com o Smithery...');
  console.log('Verificando especificamente o lazy loading e a listagem de ferramentas sem autenticação...');

  try {
    // Testar a listagem de ferramentas sem configuração
    console.log('\n1. Testando a listagem de ferramentas sem configuração...');
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

      // Verificar se as ferramentas estão sendo listadas corretamente
      if (toolsResponse.data && toolsResponse.data.tools && toolsResponse.data.tools.length > 0) {
        console.log(`\n✅ Sucesso! O servidor está listando ${toolsResponse.data.tools.length} ferramentas sem autenticação.`);
        console.log('Isso indica que o lazy loading está configurado corretamente para o Smithery.');
      } else {
        console.log(`\n❌ Falha! O servidor não está listando ferramentas corretamente.`);
        console.log('Verifique a implementação do lazy loading.');
      }
    }

    // Testar com configuração em base64
    console.log('\n2. Testando com configuração em base64...');
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

      // Verificar se as ferramentas estão sendo listadas corretamente com configuração
      if (configResponse.data && configResponse.data.tools && configResponse.data.tools.length > 0) {
        console.log(`\n✅ Sucesso! O servidor está listando ${configResponse.data.tools.length} ferramentas com configuração.`);
      } else {
        console.log(`\n❌ Falha! O servidor não está listando ferramentas corretamente com configuração.`);
      }
    }

    console.log('\nTestes de integração com o Smithery concluídos!');
    console.log('\nSe os testes foram bem-sucedidos, o servidor deve funcionar corretamente com o Smithery.');
    console.log('Lembre-se de que o Smithery requer que o servidor liste ferramentas sem autenticação,');
    console.log('mas a autenticação deve ocorrer no momento da execução das ferramentas (lazy loading).');

  } catch (error) {
    console.error('Erro ao testar o servidor:', error);
  }
}

// Executar o teste
main();
