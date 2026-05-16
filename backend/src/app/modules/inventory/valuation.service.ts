import { Prisma } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class ValuationService {
  /**
   * Calculate and update Weighted Average Cost (WAC) for an item
   * WAC = (Existing Inventory Value + New Inventory Value) / (Existing Inventory Quantity + New Inventory Quantity)
   */
  async updateWAC(params: {
    businessId: string;
    itemId: string;
    addedQuantity: number;
    unitCost: number;
    reference?: string;
    tx?: Prisma.TransactionClient;
  }) {
    const { businessId, itemId, addedQuantity, unitCost, reference, tx } = params;
    const client = tx || prisma;

    // 1. Get current item cost and total quantity
    const item = await client.item.findFirst({
      where: { id: itemId, businessId },
      include: {
        inventory: true
      }
    });

    if (!item) {
      throw new Error(`Item ${itemId} not found for business ${businessId}`);
    }

    const currentTotalStock = item.inventory.reduce((acc: number, inv: any) => acc + (inv.totalStock || 0), 0);
    const currentCostPrice = Number(item.costPrice || 0);

    // 2. Calculate new WAC
    const existingValue = currentTotalStock * currentCostPrice;
    const newValue = addedQuantity * unitCost;
    const totalQuantity = currentTotalStock + addedQuantity;

    let newWAC = currentCostPrice;
    if (totalQuantity > 0) {
      newWAC = (existingValue + newValue) / totalQuantity;
    } else if (totalQuantity === 0 && addedQuantity > 0) {
       // If total becomes 0 but we just added some (edge case where stock was negative)
       newWAC = unitCost;
    }

    // 3. Update Item Cost Price
    await client.item.update({
      where: { id: itemId },
      data: { costPrice: newWAC }
    });

    // 4. Record Valuation Snapshot (Historical Record)
    await this.recordSnapshot({
      businessId,
      itemId,
      quantity: totalQuantity,
      unitCost: newWAC,
      reference,
      tx
    });

    return {
      oldWAC: currentCostPrice,
      newWAC,
      totalQuantity,
      totalValue: totalQuantity * newWAC
    };
  }

  /**
   * Recalibrate WAC for an item based on all historical purchase movements.
   * Useful if manual adjustments or errors caused the WAC to drift.
   */
  async recalibrateWAC(businessId: string, itemId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;

    // 1. Get all "IN" movements that represent purchases/additions with cost
    const movements = await client.stockMovement.findMany({
      where: {
        itemId,
        businessId,
        type: 'IN',
        unitCost: { not: null }
      },
      orderBy: { createdAt: 'asc' }
    });

    let totalQuantity = 0;
    let totalCost = 0;
    let runningWAC = 0;

    for (const move of movements) {
      const qty = Number(move.quantity);
      const cost = Number(move.unitCost || 0);
      
      const existingValue = totalQuantity * runningWAC;
      const newValue = qty * cost;
      
      const newTotalQuantity = totalQuantity + qty;
      
      if (newTotalQuantity > 0) {
        runningWAC = (existingValue + newValue) / newTotalQuantity;
      }
      
      totalQuantity = newTotalQuantity;
    }

    // 2. Update the item with the recalibrated WAC
    await client.item.update({
      where: { id: itemId },
      data: { costPrice: runningWAC }
    });

    return {
      recalibratedWAC: runningWAC,
      totalQuantityProcessed: totalQuantity
    };
  }

  /**
   * Get valuation history for an item
   */
  async getValuationHistory(businessId: string, itemId: string) {
    return await prisma.inventoryValuation.findMany({
      where: { businessId, itemId },
      orderBy: { valuationDate: 'desc' }
    });
  }

  /**
   * Record a valuation snapshot without changing the unit cost
   * Used for movements that don't affect WAC (e.g., sales, breakage)
   */
  async recordSnapshot(params: {
    businessId: string;
    itemId: string;
    quantity: number;
    unitCost: number;
    reference?: string;
    tx?: Prisma.TransactionClient;
  }) {
    const { businessId, itemId, quantity, unitCost, reference, tx } = params;
    const client = tx || prisma;

    return await client.inventoryValuation.create({
      data: {
        businessId,
        itemId,
        quantity,
        unitCost,
        totalValue: quantity * unitCost,
        method: 'WAC',
        reference
      }
    });
  }

  /**
   * Get total inventory valuation for a business
   */
  async getTotalValuation(businessId: string) {
    // Get the latest valuation for each item
    const items = await prisma.item.findMany({
      where: { businessId },
      select: {
        id: true,
        title: true,
        costPrice: true,
        inventory: {
          select: {
            availableStock: true
          }
        }
      }
    });

    const valuations = items.map((item: any) => {
      const totalStock = item.inventory.reduce((acc: number, inv: any) => acc + (inv.totalStock || 0), 0);
      const value = totalStock * Number(item.costPrice || 0);
      return {
        itemId: item.id,
        title: item.title,
        totalStock,
        unitCost: Number(item.costPrice || 0),
        totalValue: value
      };
    });

    const totalBusinessValue = valuations.reduce((acc: number, v: any) => acc + v.totalValue, 0);

    return {
      valuations,
      totalBusinessValue
    };
  }
}
