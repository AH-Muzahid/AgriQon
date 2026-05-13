import { PrismaClient, StockReservation } from '../../../generated/client';

const prisma = new PrismaClient();

const create = async (data: any): Promise<StockReservation> => {
  return await prisma.stockReservation.create({
    data,
  });
};

const findMany = async (businessId: string): Promise<StockReservation[]> => {
  return await prisma.stockReservation.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
  });
};

const findById = async (id: string): Promise<StockReservation | null> => {
  return await prisma.stockReservation.findUnique({
    where: { id },
  });
};

const deleteById = async (id: string): Promise<StockReservation> => {
  return await prisma.stockReservation.delete({
    where: { id },
  });
};

export const StockReservationRepository = {
  create,
  findMany,
  findById,
  deleteById,
};
