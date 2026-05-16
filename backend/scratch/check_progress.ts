import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  const businessCount = await prisma.business.count();
  const itemCount = await prisma.item.count();
  const orderCount = await prisma.order.count();
  console.log(`Progress: Businesses: ${businessCount}, Items: ${itemCount}, Orders: ${orderCount}`);
  await prisma.$disconnect();
}

main();
