const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const counts = {
    organizations: await prisma.organization.count(),
    businesses: await prisma.business.count(),
    users: await prisma.user.count(),
    items: await prisma.item.count(),
    orders: await prisma.order.count(),
  };
  console.log(counts);
}

check().then(() => prisma.$disconnect());
