import { AiService } from '../app/modules/ai/ai.service';
import { AiRepository } from '../app/modules/ai/ai.repository';
import { prisma } from '../app/lib/prisma';

async function generateAllEmbeddings() {
  const aiService = new AiService();
  const aiRepo = new AiRepository();

  console.log('--- Starting Bulk Embedding Generation ---');

  // 1. Fetch all businesses
  const businesses = await prisma.business.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true }
  });

  console.log(`Found ${businesses.length} businesses to process.`);

  for (const business of businesses) {
    console.log(`\nProcessing business: ${business.name} (${business.id})`);

    let processedCount = 0;
    const totalMissing = await aiRepo.countItemsWithoutEmbeddings(business.id);
    
    console.log(`Found ${totalMissing} items missing embeddings.`);

    while (processedCount < totalMissing) {
      const items = await aiRepo.getItemsWithoutEmbeddings(business.id, 20); // Small batch to be safe
      
      if (items.length === 0) break;

      console.log(`  Generating embeddings for batch of ${items.length} items...`);

      for (const item of items) {
        try {
          const text = aiService.constructItemText(item);
          await aiService.updateItemEmbedding(business.id, item.id, text);
          processedCount++;
          
          // Optional: Add a small delay if rate limited
          // await new Promise(resolve => setTimeout(resolve, 100)); 
        } catch (error: any) {
          console.error(`    Failed to generate embedding for item ${item.id}:`, error.message);
        }
      }

      console.log(`  Progress: ${processedCount}/${totalMissing}`);
    }
  }

  console.log('\n--- Bulk Embedding Generation Completed ---');
}

generateAllEmbeddings()
  .catch((error) => {
    console.error('Fatal error in migration script:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
