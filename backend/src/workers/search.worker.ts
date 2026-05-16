import { Job } from 'bullmq';
import { QueueName } from '../app/lib/bullmq';
import { createWorker } from './base.worker';
import { ProductCreatedPayload, ProductUpdatedPayload } from '../shared/events/domain-events';
import { ProductRepository } from '../app/modules/products/product.repository';

const productRepo = new ProductRepository();

/**
 * Search Worker
 * Handles syncing data to search indexes (e.g., Elasticsearch, Algolia, or local search tables).
 */
export const searchWorker = createWorker(QueueName.SEARCH, async (job: Job) => {
  const { name, data } = job;

  switch (name) {
    case 'sync-product-index':
      await syncProductIndex(data as ProductCreatedPayload | ProductUpdatedPayload);
      break;

    default:
      console.warn(`[SearchWorker] Unknown job name: ${name}`);
      break;
  }
});

async function syncProductIndex(payload: ProductCreatedPayload | ProductUpdatedPayload) {
  const { productId, title } = payload;
  
  console.log(`[SearchWorker] Updating search vector for product: ${productId} (${title})`);
  
  await productRepo.updateSearchVector(productId);
  
  console.log(`[SearchWorker] Search vector updated for product: ${productId}`);
}
