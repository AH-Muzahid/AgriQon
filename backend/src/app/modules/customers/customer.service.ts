import { CustomerRepository } from './customer.repository';
import { AppError } from '../../errors/AppError';
import { Prisma } from '@prisma/client';

export class CustomerService {
  constructor(private customerRepo: CustomerRepository) {}

  async getAllCustomers(params: {
    businessId: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;
    const { items, total } = await this.customerRepo.findAll({
      ...params,
      skip,
      take: params.limit,
    });

    return {
      items,
      meta: { page: params.page, limit: params.limit, total },
    };
  }

  async getCustomerById(id: string, businessId: string) {
    const customer = await this.customerRepo.findById(id, businessId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    return customer;
  }

  async createCustomer(businessId: string, data: Prisma.CustomerUncheckedCreateInput) {
    return await this.customerRepo.create({ ...data, businessId });
  }

  async updateCustomer(id: string, businessId: string, data: Prisma.CustomerUpdateInput) {
    await this.getCustomerById(id, businessId);
    return await this.customerRepo.update(id, businessId, data);
  }

  async deleteCustomer(id: string, businessId: string) {
    await this.getCustomerById(id, businessId);
    // Rule 14: Soft delete only
    return await this.customerRepo.softDelete(id, businessId);
  }
}
