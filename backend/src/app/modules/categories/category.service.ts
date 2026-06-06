import { Category } from '../../../generated/client';
import { CategoryRepository } from './category.repository';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';

const createCategory = async (data: any): Promise<Category> => {
  return await CategoryRepository.create(data);
};

const getAllCategories = async (businessId: string): Promise<Category[]> => {
  return await CategoryRepository.findMany(businessId);
};

const getCategoryById = async (id: string, businessId: string): Promise<Category> => {
  const category = await CategoryRepository.findById(id, businessId);
  if (!category) {
    throw new AppError('Category not found', httpStatus.NOT_FOUND);
  }
  return category;
};

const updateCategory = async (id: string, businessId: string, data: any): Promise<Category> => {
  await getCategoryById(id, businessId);
  return await CategoryRepository.update(id, businessId, data);
};

const deleteCategory = async (id: string, businessId: string): Promise<Category> => {
  await getCategoryById(id, businessId);
  return await CategoryRepository.deleteById(id, businessId);
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
