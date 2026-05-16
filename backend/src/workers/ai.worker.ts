import { Job } from 'bullmq';
import { QueueName } from '../app/lib/bullmq';
import { createWorker } from './base.worker';
import { ProductCreatedPayload, ProductUpdatedPayload } from '../shared/events/domain-events';
import { AiService } from '../app/modules/ai/ai.service';
import { prisma } from '../app/lib/prisma';

const aiService = new AiService();

/**
 * AI Worker
 * Handles background AI tasks like generating embeddings, 
 * analyzing trends, and processing business insights.
 */
export const aiWorker = createWorker(QueueName.AI, async (job: Job) => {
  const { name, data } = job;
  
  switch (name) {
    case 'generate-product-embedding':
      await generateProductEmbedding(data as ProductCreatedPayload | ProductUpdatedPayload);
      break;
    default:
      console.warn(`[AIWorker] Unknown job name: ${name}`);
      break;
  }
});

async function generateProductEmbedding(payload: ProductCreatedPayload | ProductUpdatedPayload) {
  const { businessId, productId } = payload;
  
  // Fetch full product details for better context
  const product = await prisma.item.findUnique({
    where: { id: productId },
    include: {
      category: true,
      brand: true,
      inventory: {
        select: { availableStock: true }
      }
    }
  });

  if (!product) {
    console.warn(`[AIWorker] Product not found for embedding: ${productId}`);
    return;
  }

  console.log(`[AIWorker] Generating embedding for product: ${productId} (${product.title})`);
  
  const totalStock = product.inventory.reduce((sum: number, inv: any) => sum + inv.availableStock, 0);

  // Construct a descriptive text for better retrieval performance
  const text = aiService.constructItemText(product);

  await aiService.updateItemEmbedding(businessId, product.id, text);
  
  console.log(`[AIWorker] Embedding generated for product: ${productId}`);
}
