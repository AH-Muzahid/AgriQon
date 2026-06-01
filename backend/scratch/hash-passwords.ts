import { PrismaClient } from '../src/generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in the database.`);
  
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }
  
  console.log('All user passwords updated to hashed "password123" successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
