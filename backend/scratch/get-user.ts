import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    include: { business: true },
  });
  console.log('USERS:', JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
