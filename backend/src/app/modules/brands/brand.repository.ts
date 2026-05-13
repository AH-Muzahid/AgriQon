import { PrismaClient, Brand } from '../../../generated/client';

const prisma = new PrismaClient();

const create = async (data: any): Promise<Brand> => {
  return await prisma.brand.create({
    data,
  });
};

const findMany = async (businessId: string): Promise<Brand[]> => {
  return await prisma.brand.findMany({
    where: { businessId },
  });
};

const findById = async (id: string): Promise<Brand | null> => {
  return await prisma.brand.findUnique({
    where: { id },
  });
};

const update = async (id: string, data: any): Promise<Brand> => {
  return await prisma.brand.update({
    where: { id },
    data,
  });
};

const deleteById = async (id: string): Promise<Brand> => {
  return await prisma.brand.delete({
    where: { id },
  });
};

export const BrandRepository = {
  create,
  findMany,
  findById,
  update,
  deleteById,
};
