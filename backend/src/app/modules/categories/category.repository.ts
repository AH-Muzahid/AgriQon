import { PrismaClient, Category } from '../../../generated/client';

const prisma = new PrismaClient();

const create = async (data: any): Promise<Category> => {
  return await prisma.category.create({
    data,
  });
};

const findMany = async (businessId?: string): Promise<Category[]> => {
  return await prisma.category.findMany({
    where: businessId ? { businessId } : {},
    include: {
      children: true,
    },
  });
};

const findById = async (id: string): Promise<Category | null> => {
  return await prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
      parent: true,
    },
  });
};

const update = async (id: string, data: any): Promise<Category> => {
  return await prisma.category.update({
    where: { id },
    data,
  });
};

const deleteById = async (id: string): Promise<Category> => {
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
