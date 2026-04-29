// Debug script for LLM connection
const { createLLMClient, listModels, getDefaultModel } = require('./src/lib/llm.ts');

async function debugLLM() {
  console.log('🔍 Debugging LLM Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('LLM_API_KEY:', process.env.LLM_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('LLM_BASE_URL:', process.env.LLM_BASE_URL || 'https://api.openai.com/v1');
  console.log('LLM_DEFAULT_MODEL:', process.env.LLM_DEFAULT_MODEL || 'qwen-model');
  console.log('LLM_AVAILABLE_MODELS:', process.env.LLM_AVAILABLE_MODELS || 'Not set');
  
  try {
    // Test model listing
    console.log('\n🔍 Testing model listing...');
    const models = await listModels();
    console.log('✅ Models found:', models.length);
    console.log('First 5 models:', models.slice(0, 5).map(m => m.id));
    
    // Test default model
    console.log('\n🎯 Default model:', getDefaultModel());
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

debugLLM();
