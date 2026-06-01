import { Category } from '../../../generated/client';
import { CategoryRepository } from './category.repository';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';

const createCategory = async (data: any): Promise<Category> => {
  return await CategoryRepository.create(data);
};

const getAllCategories = async (businessId?: string): Promise<Category[]> => {
  return await CategoryRepository.findMany(businessId);
};

const getCategoryById = async (id: string): Promise<Category> => {
  const category = await CategoryRepository.findById(id);
  if (!category) {
    throw new AppError('Category not found', httpStatus.NOT_FOUND);
  }
  return category;
};

const updateCategory = async (id: string, data: any): Promise<Category> => {
  await getCategoryById(id);
  return await CategoryRepository.update(id, data);
};

const deleteCategory = async (id: string): Promise<Category> => {
  await getCategoryById(id);
  return await CategoryRepository.deleteById(id);
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
