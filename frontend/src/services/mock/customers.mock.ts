import { CustomerContract, CreateCustomerInput, UpdateCustomerInput } from '@/types/contracts/customer.contract';
import { MOCK_CUSTOMERS } from '@/lib/mock-erp-data';

export const customersMock = {
  async list(): Promise<CustomerContract[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_CUSTOMERS as any[] as CustomerContract[]), 100));
  },

  async getById(id: string): Promise<CustomerContract | null> {
    return new Promise((resolve) => {
      const c = MOCK_CUSTOMERS.find((item) => item.id === id);
      setTimeout(() => resolve((c as any as CustomerContract) || null), 100);
    });
  },

  async create(input: CreateCustomerInput): Promise<CustomerContract> {
    return new Promise((resolve) => {
      const created: CustomerContract = {
        id: `cust_${Math.floor(Math.random() * 10000)}`,
        ...input,
        purchasesCount: 0,
        totalSpent: 0,
        dueAmount: 0,
        status: 'ACTIVE',
        timeline: [],
      };
      setTimeout(() => resolve(created), 100);
    });
  },

  async update(id: string, input: UpdateCustomerInput): Promise<CustomerContract> {
    return new Promise((resolve, reject) => {
      const c = MOCK_CUSTOMERS.find((item) => item.id === id);
      if (!c) return reject(new Error('Customer not found'));
      const updated: CustomerContract = {
        ...(c as any as CustomerContract),
        ...input,
      };
      setTimeout(() => resolve(updated), 100);
    });
  },

  async delete(id: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 100));
  },
};
export default customersMock;
