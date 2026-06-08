import { ProductContract, CreateProductInput, UpdateProductInput } from '@/types/contracts/product.contract';
import { MOCK_PRODUCTS } from '@/lib/mock-erp-data';

export const productsMock = {
  async list(): Promise<ProductContract[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTS as ProductContract[]), 100));
  },

  async getById(sku: string): Promise<ProductContract | null> {
    return new Promise((resolve) => {
      const p = MOCK_PRODUCTS.find((item) => item.sku === sku);
      setTimeout(() => resolve((p as ProductContract) || null), 100);
    });
  },

  async create(input: CreateProductInput): Promise<ProductContract> {
    return new Promise((resolve) => {
      const created: ProductContract = {
        ...input,
        category: input.category || 'Uncategorized',
        brand: input.brand || 'Generic',
        status: 'ACTIVE',
        description: input.description || '',
      };
      setTimeout(() => resolve(created), 100);
    });
  },

  async update(sku: string, input: UpdateProductInput): Promise<ProductContract> {
    return new Promise((resolve, reject) => {
      const p = MOCK_PRODUCTS.find((item) => item.sku === sku);
      if (!p) {
        return reject(new Error('Product SKU not found'));
      }
      const updated: ProductContract = {
        ...(p as ProductContract),
        ...input,
      };
      setTimeout(() => resolve(updated), 100);
    });
  },

  async delete(sku: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 100));
  },
};
