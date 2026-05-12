import { BusinessRepository } from './business.repository';
import { CreateBusinessDTO } from './business.validation';
import { AppError } from '../../errors/AppError';

export class BusinessService {
  constructor(private businessRepo: BusinessRepository) {}

  async createBusiness(data: CreateBusinessDTO) {
    // Add logic for checking if organization exists if needed
    return await this.businessRepo.create(data);
  }

  async getBusinessById(id: string) {
    const business = await this.businessRepo.findById(id);
    if (!business) {
      throw new AppError('Business not found', 404);
    }
    return business;
  }
}
