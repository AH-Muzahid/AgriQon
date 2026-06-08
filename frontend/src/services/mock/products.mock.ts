import { ProductContract, CreateProductInput, UpdateProductInput } from '@/types/contracts/product.contract';
import { apiClient } from '../api/client';

export const productsMock = {
  async list(): Promise<ProductContract[]> {
    const res = await apiClient.get<any>('/products?limit=100');
    const items = res.items || [];
    return items.map((item: any) => ({
      sku: item.sku || item.id,
      name: item.title,
      category: item.category?.name || 'Uncategorized',
      brand: item.brand?.name || 'Generic',
      costPrice: Number(item.costPrice || 0),
      sellingPrice: Number(item.price),
      status: item.deletedAt ? 'INACTIVE' : 'ACTIVE',
      description: item.description || '',
    }));
  },

  async getById(sku: string): Promise<ProductContract | null> {
    try {
      const item = await apiClient.get<any>(`/products/${sku}`);
      if (item) {
        return {
          sku: item.sku || item.id,
          name: item.title,
          category: item.category?.name || 'Uncategorized',
          brand: item.brand?.name || 'Generic',
          costPrice: Number(item.costPrice || 0),
          sellingPrice: Number(item.price),
          status: item.deletedAt ? 'INACTIVE' : 'ACTIVE',
          description: item.description || '',
        };
      }
    } catch {
      const list = await this.list();
      return list.find((item) => item.sku === sku) || null;
    }
    return null;
  },

  async create(input: CreateProductInput): Promise<ProductContract> {
    let categoryId = '';
    try {
      const cats = await apiClient.get<any>('/categories');
      const matched = cats.find((c: any) => c.name.toLowerCase() === (input.category || '').toLowerCase());
      if (matched) {
        categoryId = matched.id;
      } else if (cats.length > 0) {
        categoryId = cats[0].id;
      }
    } catch {}

    const payload = {
      title: input.name,
      description: input.description || '',
      price: input.sellingPrice,
      costPrice: input.costPrice,
      categoryId: categoryId || undefined,
      sku: input.sku,
    };

    const item = await apiClient.post<any>('/products', payload);
    return {
      sku: item.sku || item.id,
      name: item.title,
      category: input.category || 'Uncategorized',
      brand: input.brand || 'Generic',
      costPrice: Number(item.costPrice || 0),
      sellingPrice: Number(item.price),
      status: 'ACTIVE',
      description: item.description || '',
    };
  },

  async update(sku: string, input: UpdateProductInput): Promise<ProductContract> {
    let id = sku;
    try {
      const list = await apiClient.get<any>('/products?limit=100');
      const found = (list.items || []).find((item: any) => item.sku === sku || item.id === sku);
      if (found) {
        id = found.id;
      }
    } catch {}

    let categoryId = undefined;
    if (input.category) {
      try {
        const cats = await apiClient.get<any>('/categories');
        const matched = cats.find((c: any) => c.name.toLowerCase() === input.category!.toLowerCase());
        if (matched) categoryId = matched.id;
      } catch {}
    }

    const payload = {
      title: input.name,
      description: input.description,
      price: input.sellingPrice,
      costPrice: input.costPrice,
      categoryId,
      status: input.status,
    };

    const item = await apiClient.patch<any>(`/products/${id}`, payload);
    return {
      sku: item.sku || item.id,
      name: item.title,
      category: input.category || 'Uncategorized',
      brand: input.brand || 'Generic',
      costPrice: Number(item.costPrice || 0),
      sellingPrice: Number(item.price),
      status: input.status || 'ACTIVE',
      description: item.description || '',
    };
  },

  async delete(sku: string): Promise<boolean> {
    let id = sku;
    try {
      const list = await apiClient.get<any>('/products?limit=100');
      const found = (list.items || []).find((item: any) => item.sku === sku || item.id === sku);
      if (found) {
        id = found.id;
      }
    } catch {}

    await apiClient.delete(`/products/${id}`);
    return true;
  },
};
export default productsMock;
