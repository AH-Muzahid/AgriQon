import { WarehouseRepository } from "./warehouse.repository";
import { Prisma } from "../../../generated/client";
import { AppError } from "../../errors/AppError";

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

  async updateWarehouse(
    id: string,
    businessId: string,
    data: Prisma.WarehouseUpdateInput,
  ) {
    return await this.warehouseRepo.update(id, businessId, data);
  }

  async deleteWarehouse(id: string, businessId: string) {
    const warehouse = await this.warehouseRepo.findById(id, businessId);
    if (!warehouse) throw new AppError("Warehouse not found", 404);
    if (warehouse.isDefault) {
      throw new AppError("Cannot delete the default warehouse", 400);
    }
    const inventoryCount = await this.warehouseRepo.countInventory(id);
    if (inventoryCount > 0) {
      throw new AppError(
        "Cannot delete a warehouse that has inventory. Reassign or clear inventory first.",
        400,
      );
    }
    return await this.warehouseRepo.delete(id, businessId);
  }
}
