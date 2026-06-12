export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
}

export interface UpdateSupplierInput {
  name?: string;
  contact?: string;
  email?: string;
  phone?: string;
}
