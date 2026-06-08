export interface ProductContract {
  sku: string;
  name: string;
  category: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  status: 'ACTIVE' | 'INACTIVE';
  description: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  category?: string;
  brand?: string;
  costPrice: number;
  sellingPrice: number;
  description?: string;
}

export interface UpdateProductInput {
  name?: string;
  category?: string;
  brand?: string;
  costPrice?: number;
  sellingPrice?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  description?: string;
}
