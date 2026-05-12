import { StockMovementRepository } from './stock-movement.repository';

export class StockMovementService {
  constructor(private stockMovementRepo: StockMovementRepository) {}

  async getMovements(params: {
    businessId: string;
    inventoryId?: string;
    itemId?: string;
    warehouseId?: string;
    limit?: number;
    skip?: number;
  }) {
    return await this.stockMovementRepo.findMany(params);
  }
}
