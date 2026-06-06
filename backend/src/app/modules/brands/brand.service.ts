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

const getBrandById = async (id: string, businessId: string): Promise<Brand> => {
  const brand = await BrandRepository.findById(id, businessId);
  if (!brand) {
    throw new AppError('Brand not found', httpStatus.NOT_FOUND);
  }
  return brand;
};

const updateBrand = async (id: string, businessId: string, data: any): Promise<Brand> => {
  await getBrandById(id, businessId);
  return await BrandRepository.update(id, businessId, data);
};

const deleteBrand = async (id: string, businessId: string): Promise<Brand> => {
  await getBrandById(id, businessId);
  return await BrandRepository.deleteById(id, businessId);
};

export const BrandService = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};
