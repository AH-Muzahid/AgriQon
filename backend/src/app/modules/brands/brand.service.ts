import { Brand } from '../../../generated/client';
import { BrandRepository } from './brand.repository';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';

const createBrand = async (data: any): Promise<Brand> => {
  return await BrandRepository.create(data);
};

const getAllBrands = async (businessId: string): Promise<Brand[]> => {
  return await BrandRepository.findMany(businessId);
};

const getBrandById = async (id: string): Promise<Brand> => {
  const brand = await BrandRepository.findById(id);
  if (!brand) {
    throw new AppError('Brand not found', httpStatus.NOT_FOUND);
  }
  return brand;
};

const updateBrand = async (id: string, data: any): Promise<Brand> => {
  await getBrandById(id);
  return await BrandRepository.update(id, data);
};

const deleteBrand = async (id: string): Promise<Brand> => {
  await getBrandById(id);
  return await BrandRepository.deleteById(id);
};

export const BrandService = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};
