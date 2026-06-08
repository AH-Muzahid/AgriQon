export interface BusinessProfile {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  taxId?: string;
  currency: string;
  timezone: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  businessId: string;
  name: string;
  code: string;
  location?: string;
  isDefault: boolean;
}
