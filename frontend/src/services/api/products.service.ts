import { ProductContract, CreateProductInput, UpdateProductInput } from '@/types/contracts/product.contract';
import { apiClient } from './client';

export const productsService = {
  async list(): Promise<ProductContract[]> {
    const res = await apiClient.client.get('/products?limit=100');
    const body = res.data || {};
    const items = body.data?.items || body.data || [];

    return items.map((item: any) => ({
      sku: item.sku || item.id,
      name: item.title,
      category: item.category?.name || 'Uncategorized',
      brand: item.brand?.name || 'Generic',
      costPrice: Number(item.costPrice || 0),
      sellingPrice: Number(item.price || 0),
      status: item.deletedAt ? 'INACTIVE' : 'ACTIVE',
      description: item.description || '',
    }));
  },

  async getById(sku: string): Promise<ProductContract | null> {
    try {
      const res = await apiClient.client.get(`/products/${sku}`);
      const body = res.data || {};
      const item = body.data || body;
      if (item) {
        return {
          sku: item.sku || item.id,
          name: item.title,
          category: item.category?.name || 'Uncategorized',
          brand: item.brand?.name || 'Generic',
          costPrice: Number(item.costPrice || 0),
          sellingPrice: Number(item.price || 0),
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
      const catsRes = await apiClient.client.get('/categories');
      const catsBody = catsRes.data || {};
      const cats = catsBody.data || catsBody || [];
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

    const res = await apiClient.post<any>('/products', payload);
    const item = res.data || res;
    return {
      sku: item.sku || item.id,
      name: item.title,
      category: input.category || 'Uncategorized',
      brand: input.brand || 'Generic',
      costPrice: Number(item.costPrice || 0),
      sellingPrice: Number(item.price || 0),
      status: 'ACTIVE',
      description: item.description || '',
    };
  },

  async update(sku: string, input: UpdateProductInput): Promise<ProductContract> {
    let id = sku;
    try {
      const listRes = await apiClient.client.get('/products?limit=100');
      const listBody = listRes.data || {};
      const items = listBody.data?.items || listBody.data || [];
      const found = items.find((item: any) => item.sku === sku || item.id === sku);
      if (found) {
        id = found.id;
      }
    } catch {}

    let categoryId = undefined;
    if (input.category) {
      try {
        const catsRes = await apiClient.client.get('/categories');
        const catsBody = catsRes.data || {};
        const cats = catsBody.data || catsBody || [];
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

    const res = await apiClient.patch<any>(`/products/${id}`, payload);
    const item = res.data || res;
    return {
      sku: item.sku || item.id,
      name: item.title,
      category: input.category || 'Uncategorized',
      brand: input.brand || 'Generic',
      costPrice: Number(item.costPrice || 0),
      sellingPrice: Number(item.price || 0),
      status: input.status || 'ACTIVE',
      description: item.description || '',
    };
  },

  async delete(sku: string): Promise<boolean> {
    let id = sku;
    try {
      const listRes = await apiClient.client.get('/products?limit=100');
      const listBody = listRes.data || {};
      const items = listBody.data?.items || listBody.data || [];
      const found = items.find((item: any) => item.sku === sku || item.id === sku);
      if (found) {
        id = found.id;
      }
    } catch {}

    await apiClient.delete(`/products/${id}`);
    return true;
  },
};
export default productsService;
