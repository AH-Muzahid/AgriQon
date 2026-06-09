import { WarehouseRepository } from "./warehouse.repository";
import { Prisma } from "../../../generated/client";
import { SubscriptionGuardService } from "../subscriptions/subscription-guard.service";
import { FeatureGuardService } from "../subscriptions/feature-guard.service";
import { FeatureCode } from "../subscriptions/types/feature.types";
import { AppError } from "../../errors/AppError";

export class WarehouseService {
  constructor(
    private warehouseRepo: WarehouseRepository,
    private subscriptionGuard?: SubscriptionGuardService,
    private featureGuard?: FeatureGuardService,
  ) {}

  async createWarehouse(data: Prisma.WarehouseUncheckedCreateInput, userId?: string) {
    // Phase S3: Subscription enforcement (skipped during onboarding when guard is not provided)
    if (this.subscriptionGuard) {
      await this.subscriptionGuard.validateBusinessSubscription(data.businessId);
    }

    // Phase S4: Feature gating (MULTI_BRANCH)
    if (this.featureGuard) {
      const existingCount = await this.warehouseRepo.count(data.businessId);
      if (existingCount >= 1) {
        await this.featureGuard.validateFeatureAccess(data.businessId, FeatureCode.MULTI_BRANCH, userId);
      }
    }

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
