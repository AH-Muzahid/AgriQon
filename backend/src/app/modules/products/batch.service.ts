import { ProductBatch } from '../../../generated/client';
import { ProductBatchRepository } from './batch.repository';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';

const createBatch = async (data: any): Promise<ProductBatch> => {
  return await ProductBatchRepository.create(data);
};

const getAllBatches = async (businessId: string, itemId?: string): Promise<ProductBatch[]> => {
  return await ProductBatchRepository.findMany(businessId, itemId);
};

const getBatchById = async (id: string): Promise<ProductBatch> => {
  const batch = await ProductBatchRepository.findById(id);
  if (!batch) {
    throw new AppError('Batch not found', httpStatus.NOT_FOUND);
  }
  return batch;
};

const deleteBatch = async (id: string): Promise<ProductBatch> => {
  await getBatchById(id);
  return await ProductBatchRepository.deleteById(id);
};

export const ProductBatchService = {
  createBatch,
  getAllBatches,
  getBatchById,
  deleteBatch,
};
