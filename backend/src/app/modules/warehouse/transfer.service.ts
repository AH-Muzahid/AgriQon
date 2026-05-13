import { WarehouseTransfer } from '../../../generated/client';
import { WarehouseTransferRepository } from './transfer.repository';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';

const initiateTransfer = async (data: any): Promise<WarehouseTransfer> => {
  // In a real app, this would involve deducting from source inventory
  return await WarehouseTransferRepository.create(data);
};

const getAllTransfers = async (businessId: string): Promise<WarehouseTransfer[]> => {
  return await WarehouseTransferRepository.findMany(businessId);
};

const getTransferById = async (id: string): Promise<WarehouseTransfer> => {
  const transfer = await WarehouseTransferRepository.findById(id);
  if (!transfer) {
    throw new AppError('Transfer not found', httpStatus.NOT_FOUND);
  }
  return transfer;
};

const updateTransferStatus = async (id: string, status: string): Promise<WarehouseTransfer> => {
  await getTransferById(id);
  // In a real app, 'COMPLETED' would add to destination inventory
  return await WarehouseTransferRepository.updateStatus(id, status);
};

export const WarehouseTransferService = {
  initiateTransfer,
  getAllTransfers,
  getTransferById,
  updateTransferStatus,
};
