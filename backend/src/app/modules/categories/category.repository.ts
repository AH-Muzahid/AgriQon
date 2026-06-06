import { PrismaClient, Category } from '../../../generated/client';

const prisma = new PrismaClient();

const create = async (data: any): Promise<Category> => {
  return await prisma.category.create({
    data,
  });
};

const findMany = async (businessId: string): Promise<Category[]> => {
  return await prisma.category.findMany({
    where: { businessId },
    include: {
      children: true,
    },
  });
};

const findById = async (id: string, businessId: string): Promise<Category | null> => {
  return await prisma.category.findFirst({
    where: { id, businessId },
    include: {
      children: true,
      parent: true,
    },
  });
};

const update = async (id: string, _businessId: string, data: any): Promise<Category> => {
  // Tenant ownership verified by service via findById before calling update.
  return await prisma.category.update({
    where: { id },
    data,
  });
};

const deleteById = async (id: string, _businessId: string): Promise<Category> => {
  return await prisma.category.delete({
    where: { id },
  });
};

export const CategoryRepository = {
  create,
  findMany,
  findById,
  update,
  deleteById,
};
