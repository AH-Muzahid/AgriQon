import { AiService } from '../app/modules/ai/ai.service';
import { prisma } from '../app/lib/prisma';
import { env } from '../config/env';

async function main() {
  console.log('--- AI Integration Test ---');
  console.log(`Current Provider: ${env.aiProvider.toUpperCase()}`);
  
  const aiService = new AiService();
  
  // Find a business to test with
  const business = await prisma.business.findFirst();
  if (!business) {
    console.error('No business found in database to test with.');
    process.exit(1);
  }

  console.log(`Testing with Business: ${business.name} (${business.id})`);

  try {
    // 1. Test Embedding Generation
    console.log('\n1. Testing Embedding Generation...');
    const testText = 'High quality organic fertilizer for rice crops.';
    const embedding = await (aiService as any).provider.generateEmbedding(testText);
    
    if (embedding && Array.isArray(embedding)) {
      console.log(`✅ Embedding generated successfully. Dimension: ${embedding.length}`);
      console.log(`Preview: [${embedding.slice(0, 5).join(', ')} ... ]`);
    } else {
      console.error('❌ Failed to generate embedding.');
    }

    // 2. Test RAG Context
    console.log('\n2. Testing Business Context Gathering...');
    const context = await (aiService as any).getEnrichedBusinessContext(business.id);
    console.log('Context Snippet:');
    console.log(context.substring(0, 300) + '...');

    // 3. Test Chat Response
    console.log('\n3. Testing Chat Response...');
    const prompt = "What are our top selling items and do we have any stock alerts?";
    const chatResult = await aiService.generateChatResponse(business.id, prompt);
    
    if (chatResult && chatResult.response) {
      console.log(`✅ Chat response generated (Source: ${chatResult.contextSource})`);
      console.log('\n--- AI RESPONSE ---');
      console.log(chatResult.response);
      console.log('------------------');
    } else {
      console.error('❌ Failed to generate chat response.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
