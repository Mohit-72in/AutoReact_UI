require('dotenv').config();
const GeminiAgent = require('./services/geminiAgent');

async function testGeminiAgent() {
  console.log('🧪 Testing Gemini Agent...\n');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    return;
  }

  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

  const agent = new GeminiAgent(apiKey);

  console.log('\n🔑 Verifying API key...');
  const isValid = await agent.verifyKey();

  if (!isValid) {
    console.error('❌ API key verification failed');
    return;
  }

  console.log('✅ API key verified successfully!\n');

  console.log('🎨 Generating a simple button component...');

  try {
    const result = await agent.generateComponent('Create a blue button with rounded corners that says "Click Me"');

    console.log('\n✅ Generation successful!');
    console.log('\n📝 Generated Code:');
    console.log('─'.repeat(80));
    console.log(result.code);
    console.log('─'.repeat(80));
    console.log('\n💬 Message:', result.message);

  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    console.error(error);
  }
}

testGeminiAgent().catch(console.error);
