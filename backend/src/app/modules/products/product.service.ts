import { Prisma, MovementType } from '../../../generated/client';
import { ProductRepository } from './product.repository';
import { InventoryService } from '../inventory/inventory.service';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

export class ProductService {
  constructor(
    private productRepo: ProductRepository,
    private inventoryService: InventoryService
  ) {}

  /**
   * Rule 3: Use Transactions for critical workflows (Product + Initial Stock)
   */
  async createProduct(params: {
    businessId: string;
    data: Prisma.ItemUncheckedCreateInput & { initialStock?: number; warehouseId?: string };
  }) {
    const { businessId, data } = params;
    const { initialStock, warehouseId, ...productData } = data;

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const productRepo = new ProductRepository(tx);
      
      // 1. Create Product
      const product = await productRepo.create({
        ...productData,
        businessId,
      });

      // 2. If initial stock is provided, adjust inventory
      if (initialStock !== undefined && initialStock > 0) {
        if (!warehouseId) {
          throw new AppError('warehouseId is required when providing initialStock', 400);
        }

        await this.inventoryService.adjustStock({
          businessId,
          itemId: product.id,
          warehouseId,
          quantity: initialStock,
          type: MovementType.IN,
          reason: 'Initial stock on creation',
          tx,
        });
      }

      return product;
    });
  }

  async getProductById(id: string, businessId: string) {
    const product = await this.productRepo.findById(id, businessId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async updateProduct(id: string, businessId: string, data: Prisma.ItemUpdateInput) {
    // Check if product exists
    await this.getProductById(id, businessId);
    
    return await this.productRepo.update(id, businessId, data);
  }

  async deleteProduct(id: string, businessId: string) {
    // Check if product exists
    await this.getProductById(id, businessId);
    
    return await this.productRepo.delete(id, businessId);
  }

  async getAllProducts(params: {
    businessId: string;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const { items, total } = await this.productRepo.findAll({
      ...params,
      skip,
      take,
    });

    return {
      items,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
      },
    };
  }
}
