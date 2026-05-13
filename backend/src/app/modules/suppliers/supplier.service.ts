import { SupplierRepository } from './supplier.repository';
import { AppError } from '../../errors/AppError';

export class SupplierService {
  private supplierRepository: SupplierRepository;

  constructor() {
    this.supplierRepository = new SupplierRepository();
  }

  async createSupplier(businessId: string, data: any) {
    return this.supplierRepository.create({
      ...data,
      businessId,
    });
  }

  async getAllSuppliers(businessId: string, filter: any = {}) {
    return this.supplierRepository.findMany(businessId, filter);
  }

  async getSupplierById(id: string, businessId: string) {
    const supplier = await this.supplierRepository.findById(id, businessId);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }
    return supplier;
  }

  async updateSupplier(id: string, businessId: string, data: any) {
    await this.getSupplierById(id, businessId);
    return this.supplierRepository.update(id, businessId, data);
  }

  async deleteSupplier(id: string, businessId: string) {
    await this.getSupplierById(id, businessId);
    return this.supplierRepository.delete(id, businessId);
  }
}
