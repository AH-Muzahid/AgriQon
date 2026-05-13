import { PrismaClient, ProductBatch } from '../../../generated/client';

const prisma = new PrismaClient();

const create = async (data: any): Promise<ProductBatch> => {
  return await prisma.productBatch.create({
    data,
    include: {
      item: true,
    },
  });
};

const findMany = async (businessId: string, itemId?: string): Promise<ProductBatch[]> => {
  return await prisma.productBatch.findMany({
    where: {
      businessId,
      ...(itemId && { itemId }),
    },
    include: {
      item: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const findById = async (id: string): Promise<ProductBatch | null> => {
  return await prisma.productBatch.findUnique({
    where: { id },
    include: {
      item: true,
      inventory: true,
    },
  });
};

const deleteById = async (id: string): Promise<ProductBatch> => {
  return await prisma.productBatch.delete({
    where: { id },
  });
};

export const ProductBatchRepository = {
  create,
  findMany,
  findById,
  deleteById,
};
