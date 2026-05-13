import { PrismaClient, WarehouseTransfer } from '../../../generated/client';

const prisma = new PrismaClient();

const create = async (data: any): Promise<WarehouseTransfer> => {
  return await prisma.warehouseTransfer.create({
    data,
    include: {
      source: true,
      destination: true,
    },
  });
};

const findMany = async (businessId: string): Promise<WarehouseTransfer[]> => {
  return await prisma.warehouseTransfer.findMany({
    where: { businessId },
    include: {
      source: true,
      destination: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const findById = async (id: string): Promise<WarehouseTransfer | null> => {
  return await prisma.warehouseTransfer.findUnique({
    where: { id },
    include: {
      source: true,
      destination: true,
    },
  });
};

const updateStatus = async (id: string, status: string): Promise<WarehouseTransfer> => {
  return await prisma.warehouseTransfer.update({
    where: { id },
    data: { status },
  });
};

export const WarehouseTransferRepository = {
  create,
  findMany,
  findById,
  updateStatus,
};
