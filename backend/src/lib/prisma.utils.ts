import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from './prisma';

/**
 * Executes a function within a transaction with RLS context set.
 * Use this in services when you need to ensure RLS policies are enforced.
 */
export async function withRLS<T>(
  context: { userId?: string; businessId?: string },
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    if (context.userId) {
      // Use $executeRawUnsafe carefully with sanitized IDs
      await tx.$executeRawUnsafe(`SET LOCAL app.current_user_id = '${context.userId.replace(/'/g, "''")}'`);
    }
    if (context.businessId) {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_business_id = '${context.businessId.replace(/'/g, "''")}'`);
    }
    return await fn(tx);
  });
}
