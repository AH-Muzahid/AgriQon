import { MovementType, WarehouseTransfer, Prisma } from '../../../generated/client';
import { WarehouseTransferRepository } from './transfer.repository';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import { InventoryRepository } from '../inventory/inventory.repository';
import { InventoryService } from '../inventory/inventory.service';
import { prisma } from '../../lib/prisma';
import { AccountingService } from '../accounting/accounting.service';

const inventoryService = new InventoryService(new InventoryRepository());
const accountingService = new AccountingService();

const initiateTransfer = async (data: any): Promise<WarehouseTransfer> => {
  const { businessId, sourceId, items } = data;

  if (!items || items.length === 0) {
    throw new AppError('Transfer must include at least one item', httpStatus.BAD_REQUEST);
  }

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Create Transfer Record (Nested items creation handled by repository)
    const transfer = await WarehouseTransferRepository.create(data, tx);

    // 2. Deduct from source warehouse for each item
    for (const item of items) {
      await inventoryService.adjustStock({
        businessId,
        itemId: item.itemId,
        warehouseId: sourceId,
        quantity: -item.quantity, // Deduct
        type: MovementType.OUT,
        reason: `Transfer Initiated: ${transfer.id}`,
        reference: transfer.id,
        tx,
      });
    }

    return transfer;
  });
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
  const transfer = await getTransferById(id);

  if (transfer.status === status) {
    return transfer;
  }

  // Only handle COMPLETED status for inventory addition
  // Only handle COMPLETED status for inventory addition
  if (status === 'COMPLETED') {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let totalValue = 0;

      // 1. Add to destination warehouse
      for (const item of (transfer as any).items) {
        // Calculate value for accounting
        totalValue += (item.quantity * (item.item?.costPrice || 0));

        await inventoryService.adjustStock({
          businessId: transfer.businessId,
          itemId: item.itemId,
          warehouseId: transfer.destinationId,
          quantity: item.quantity, // Add
          type: MovementType.IN,
          reason: `Transfer Completed: ${transfer.id}`,
          reference: transfer.id,
          tx,
        });
      }

      // 2. Record accounting entry
      if (totalValue > 0) {
        await accountingService.handleWarehouseTransferCompleted({
          transferId: transfer.id,
          businessId: transfer.businessId,
          sourceWarehouseId: transfer.sourceId,
          destinationWarehouseId: transfer.destinationId,
          totalValue
        }, undefined, tx);
      }

      // 3. Update status
      return await WarehouseTransferRepository.updateStatus(id, status, tx);
    });
  }

  // Handle other status updates (e.g., SHIPPED, CANCELLED)
  // Note: CANCELLED should probably reverse the deduction, but let's keep it simple for now or follow business rules
  if (status === 'CANCELLED' && transfer.status !== 'COMPLETED') {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of (transfer as any).items) {
        await inventoryService.adjustStock({
          businessId: transfer.businessId,
          itemId: item.itemId,
          warehouseId: transfer.sourceId,
          quantity: item.quantity, // Reverse deduction
          type: MovementType.IN,
          reason: `Transfer Cancelled: ${transfer.id}`,
          reference: transfer.id,
          tx,
        });
      }
      return await WarehouseTransferRepository.updateStatus(id, status, tx);
    });
  }

  return await WarehouseTransferRepository.updateStatus(id, status);
};

export const WarehouseTransferService = {
  initiateTransfer,
  getAllTransfers,
  getTransferById,
  updateTransferStatus,
};
