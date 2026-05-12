import { WarehouseRepository } from './warehouse.repository';
import { Prisma } from '@prisma/client';

export class WarehouseService {
  constructor(private warehouseRepo: WarehouseRepository) {}

  async createWarehouse(data: Prisma.WarehouseUncheckedCreateInput) {
    return await this.warehouseRepo.create(data);
  }

  async getWarehouses(businessId: string) {
    return await this.warehouseRepo.findMany(businessId);
  }

  async getWarehouseById(id: string, businessId: string) {
    return await this.warehouseRepo.findById(id, businessId);
  }

  async updateWarehouse(id: string, businessId: string, data: Prisma.WarehouseUpdateInput) {
    return await this.warehouseRepo.update(id, businessId, data);
  }
}
