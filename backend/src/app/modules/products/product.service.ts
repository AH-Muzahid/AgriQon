import { Prisma, MovementType } from '../../../generated/client';
import { ProductRepository } from './product.repository';
import { InventoryService } from '../inventory/inventory.service';
import { SubscriptionGuardService } from '../subscriptions/subscription-guard.service';
import { UsageGuardService } from '../subscriptions/usage-guard.service';
import { ReadOnlyGuardService } from '../subscriptions/read-only-guard.service';
import { ResourceType } from '../subscriptions/types/resource.types';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import { DomainEvents, emitDomainEvent } from '../../../shared/events/domain-events';

export class ProductService {
  constructor(
    private productRepo: ProductRepository,
    private inventoryService: InventoryService,
    private subscriptionGuard: SubscriptionGuardService,
    private usageGuard?: UsageGuardService,
    private readOnlyGuard?: ReadOnlyGuardService,
  ) {}

  /**
   * Rule 3: Use Transactions for critical workflows (Product + Initial Stock)
   */
  async createProduct(params: {
    businessId: string;
    data: Prisma.ItemUncheckedCreateInput & { initialStock?: number; warehouseId?: string };
    actorId?: string;
  }) {
    const { businessId, data, actorId } = params;
    const { initialStock, warehouseId, ...productData } = data;

    // Phase S6: Read-only check
    if (this.readOnlyGuard) {
      await this.readOnlyGuard.validateBusinessWritable(businessId);
    }

    // Phase S3: Subscription enforcement
    await this.subscriptionGuard.validateBusinessSubscription(businessId);

    // Phase S5: Usage limit enforcement
    if (this.usageGuard) {
      await this.usageGuard.validateUsageLimit(businessId, ResourceType.PRODUCTS, actorId);
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const productRepo = new ProductRepository(tx);
      
      // 1. Create Product
      const product = await productRepo.create({
        ...productData,
        businessId,
      });

      // 2. Emit Domain Event for Outbox
      await emitDomainEvent(
        tx,
        DomainEvents.PRODUCT_CREATED,
        {
          productId: product.id,
          businessId: product.businessId,
          title: product.title,
          sku: product.sku,
          price: Number(product.price),
        },
        businessId,
        'PRODUCT',
        product.id
      );

      // 3. If initial stock is provided, adjust inventory
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
    if (this.readOnlyGuard) {
      await this.readOnlyGuard.validateBusinessWritable(businessId);
    }

    // Check if product exists
    const existing = await this.getProductById(id, businessId);
    
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const productRepo = new ProductRepository(tx);
      const product = await productRepo.update(id, businessId, data);

      // Emit Domain Event for Outbox
      await emitDomainEvent(
        tx,
        DomainEvents.PRODUCT_UPDATED,
        {
          productId: product.id,
          businessId: product.businessId,
          title: product.title,
          sku: product.sku || undefined,
          price: Number(product.price),
        },
        businessId,
        'PRODUCT',
        product.id
      );

      return product;
    });
  }

  async deleteProduct(id: string, businessId: string) {
    if (this.readOnlyGuard) {
      await this.readOnlyGuard.validateBusinessWritable(businessId);
    }

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
