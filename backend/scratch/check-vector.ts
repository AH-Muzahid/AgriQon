import { prisma } from '../src/app/lib/prisma';

async function checkVector() {
  try {
    const result = await prisma.$queryRaw`SELECT * FROM pg_extension WHERE extname = 'vector';`;
    console.log('Vector extension:', result);
  } catch (error) {
    console.error('Error checking vector extension:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVector();
