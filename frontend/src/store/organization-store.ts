import { create } from 'zustand';
import { BusinessProfile, Warehouse } from '@/types/business';

interface OrganizationState {
  currentBusiness: BusinessProfile | null;
  warehouses: Warehouse[];
  activeWarehouseId: string | null;
  setCurrentBusiness: (business: BusinessProfile | null) => void;
  setWarehouses: (warehouses: Warehouse[]) => void;
  setActiveWarehouseId: (id: string | null) => void;
}

const MOCK_BUSINESS: BusinessProfile = {
  id: 'biz_agro_hq',
  name: 'AgroAI Ventures Ltd',
  slug: 'agroai-ventures',
  taxId: 'TX-99882211',
  currency: 'BDT',
  timezone: 'Asia/Dhaka',
  createdAt: '2026-01-01T00:00:00Z',
};

const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh_dhaka_main',
    businessId: 'biz_agro_hq',
    name: 'Dhaka Central Hub',
    code: 'DHK-01',
    location: 'Tejgaon Industrial Area, Dhaka',
    isDefault: true,
  },
  {
    id: 'wh_bogura_cold',
    businessId: 'biz_agro_hq',
    name: 'Bogura Cold Storage',
    code: 'BGR-CS2',
    location: 'Sherpur Road, Bogura',
    isDefault: false,
  },
];

export const useOrganizationStore = create<OrganizationState>((set) => ({
  currentBusiness: MOCK_BUSINESS,
  warehouses: MOCK_WAREHOUSES,
  activeWarehouseId: 'wh_dhaka_main',
  setCurrentBusiness: (business) => set({ currentBusiness: business }),
  setWarehouses: (warehouses) => set({ warehouses }),
  setActiveWarehouseId: (id) => set({ activeWarehouseId: id }),
}));
