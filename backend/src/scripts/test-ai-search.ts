import { AiService } from '../app/modules/ai/ai.service';
import { prisma } from '../app/lib/prisma';
import { env } from '../config/env';

async function testAiSearch() {
  const aiService = new AiService();
  
  // 1. Get a random business and its items
  const business = await prisma.business.findFirst({
    include: { products: { take: 2 } }
  });

  if (!business || business.products.length === 0) {
    console.log('No items found to test.');
    return;
  }

  const testItem = business.products[0];
  console.log(`Testing with item: ${testItem.title} (ID: ${testItem.id})`);

  // 2. Update embedding for this item
  console.log('Updating embedding...');
  const itemText = aiService.constructItemText(testItem);
  await aiService.updateItemEmbedding(business.id, testItem.id, itemText);

  // 3. Search for the same item using its title as prompt
  console.log(`Searching for: "${testItem.title}"`);
  const result = await aiService.generateChatResponse(business.id, testItem.title);

  console.log('Search Result Source:', result.contextSource);
  // We can't easily see the response text here without logging it, 
  // but we can check the logs table
  
  const latestLog = await prisma.aiLog.findFirst({
    where: { businessId: business.id },
    orderBy: { createdAt: 'desc' }
  });

  console.log('Latest AI Log:', {
    prompt: latestLog?.prompt,
    itemMatches: (latestLog?.contextData as any)?.itemMatches,
    hasBusinessContext: (latestLog?.contextData as any)?.hasBusinessContext
  });

  if ((latestLog?.contextData as any)?.itemMatches > 0) {
    console.log('✅ Similarity search worked! Found matching items.');
  } else {
    console.log('❌ Similarity search failed to find matching items.');
  }
}

testAiSearch()
  .catch(err => {
    console.error('Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
