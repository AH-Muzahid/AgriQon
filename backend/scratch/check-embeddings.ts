import { prisma } from '../src/app/lib/prisma';

async function checkEmbeddings() {
  try {
    const itemCount = await prisma.item.count();
    const embeddingCount = await prisma.embedding.count();
    console.log('Total items:', itemCount);
    console.log('Total embeddings:', embeddingCount);
    
    if (embeddingCount > 0) {
      const sample = await prisma.embedding.findFirst();
      console.log('Sample embedding length:', Array.isArray(sample?.vector) ? sample.vector.length : 'Not an array');
    }
  } catch (error) {
    console.error('Error checking embeddings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmbeddings();
