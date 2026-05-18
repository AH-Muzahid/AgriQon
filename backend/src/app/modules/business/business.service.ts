import { AccountingService } from '../accounting/accounting.service';
import { BusinessRepository } from './business.repository';
import { CreateBusinessDTO, UpdateBusinessDTO } from './business.validation';
import { AppError } from '../../errors/AppError';

export class BusinessService {
  private accountingService: AccountingService;

  constructor(private businessRepo: BusinessRepository) {
    this.accountingService = new AccountingService();
  }

  async createBusiness(data: CreateBusinessDTO & { organizationId: string }) {
    const business = await this.businessRepo.create(data);
    
    // Initialize mandatory accounting accounts
    await this.accountingService.initializeSystemAccounts(business.id);

    return business;
  }

  async getBusinessById(id: string) {
    const business = await this.businessRepo.findById(id);
    if (!business) {
      throw new AppError('Business not found', 404);
    }
    return business;
  }

  async getBusinessesByOrganization(organizationId: string) {
    return await this.businessRepo.findAllByOrganization(organizationId);
  }

  async getAllBusinesses() {
    return await this.businessRepo.findAll();
  }

  async updateBusiness(id: string, data: UpdateBusinessDTO) {
    await this.getBusinessById(id); // Ensure exists and not deleted
    return await this.businessRepo.update(id, data);
  }

  async deleteBusiness(id: string) {
    await this.getBusinessById(id); // Ensure exists and not deleted
    return await this.businessRepo.softDelete(id);
  }
}
