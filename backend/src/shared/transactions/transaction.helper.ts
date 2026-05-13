import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Helper utility to run a set of database operations within an Interactive Transaction.
 * This guarantees that all operations succeed, or all fail and rollback.
 * Perfect for orchestrating Payment Success, Inventory Deduction, and Invoice updates.
 */
export const runInTransaction = async <T>(
  callback: (tx: any) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(async (tx: any) => {
    return await callback(tx);
  });
};
