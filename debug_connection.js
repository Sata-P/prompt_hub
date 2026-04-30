// Debug script to test LLM connection directly
const https = require('https');
const http = require('http');

// Test basic connectivity to LLM provider
function testConnection(baseURL, apiKey) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseURL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    console.log(`🔍 Testing connection to: ${baseURL}`);
    console.log(`🔑 API Key: ${apiKey ? 'Present' : 'Missing'}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds
    };
    
    const req = client.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ Response received:', parsed);
          resolve(parsed);
        } catch (e) {
          console.log('📄 Raw response:', data);
          resolve(data);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Request error:', err.message);
      reject(err);
    });
    
    req.on('timeout', () => {
      console.error('⏰ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Load environment variables (you may need to use dotenv)
require('dotenv').config();

async function runDebug() {
  console.log('🚀 Starting LLM Connection Debug...\n');
  
  const baseURL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const apiKey = process.env.LLM_API_KEY;
  
  if (!apiKey) {
    console.error('❌ LLM_API_KEY is missing from environment variables');
    process.exit(1);
  }
  
  try {
    const result = await testConnection(baseURL, apiKey);
    console.log('\n✅ Connection successful!');
    
    if (result.data && result.data.length > 0) {
      console.log(`📝 Found ${result.data.length} models`);
      console.log('First 3 models:', result.data.slice(0, 3).map(m => m.id));
    }
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if LLM_BASE_URL is correct');
    console.log('2. Verify LLM_API_KEY is valid');
    console.log('3. Check network connectivity/firewall');
    console.log('4. Confirm provider server is running');
  }
}

runDebug();
