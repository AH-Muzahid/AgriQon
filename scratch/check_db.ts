import { PrismaClient } from '../backend/src/generated/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.item.count();
    console.log('Product count:', count);
    
    const businesses = await prisma.business.findMany();
    console.log('Businesses:', JSON.stringify(businesses.map(b => ({id: b.id, name: b.name})), null, 2));
    
    if (businesses.length > 0) {
      const items = await prisma.item.findMany({
        where: { businessId: businesses[0].id },
        take: 5
      });
      console.log('Sample items for business 0:', JSON.stringify(items.map(i => i.title), null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
