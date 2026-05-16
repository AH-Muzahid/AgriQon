import { WarehouseTransfer, Prisma } from '../../../generated/client';
import { prisma as sharedPrisma } from '../../lib/prisma';

const create = async (data: any, tx?: Prisma.TransactionClient): Promise<WarehouseTransfer> => {
  const { items, ...transferData } = data;
  const client = tx || sharedPrisma;
  return await client.warehouseTransfer.create({
    data: {
      ...transferData,
      items: {
        create: items,
      },
    },
    include: {
      source: true,
      destination: true,
      items: {
        include: {
          item: true,
        },
      },
    },
  });
};

const findMany = async (businessId: string): Promise<WarehouseTransfer[]> => {
  return await sharedPrisma.warehouseTransfer.findMany({
    where: { businessId },
    include: {
      source: true,
      destination: true,
      items: {
        include: {
          item: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const findById = async (id: string): Promise<WarehouseTransfer | null> => {
  return await sharedPrisma.warehouseTransfer.findUnique({
    where: { id },
    include: {
      source: true,
      destination: true,
      items: {
        include: {
          item: true,
        },
      },
    },
  });
};

const updateStatus = async (
  id: string,
  status: string,
  tx?: Prisma.TransactionClient
): Promise<WarehouseTransfer> => {
  const client = tx || sharedPrisma;
  return await client.warehouseTransfer.update({
    where: { id },
    data: { status },
    include: {
      items: true,
    },
  });
};

export const WarehouseTransferRepository = {
  create,
  findMany,
  findById,
  updateStatus,
};
