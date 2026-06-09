import { AccountingService } from '../accounting/accounting.service';
import { AccountingRepository } from '../accounting/accounting.repository';
import { BusinessRepository } from './business.repository';
import { CreateBusinessDTO, UpdateBusinessDTO } from './business.validation';
import { AppError } from '../../errors/AppError';
import { env } from '../../../config/env';
import { WarehouseService } from '../warehouse/warehouse.service';
import { WarehouseRepository } from '../warehouse/warehouse.repository';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../generated/client';

export class BusinessService {
  private accountingService: AccountingService;

  constructor(private businessRepo: BusinessRepository) {
    this.accountingService = new AccountingService();
  }

  async createBusiness(data: CreateBusinessDTO & { organizationId?: string; userId?: string }) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let orgId = data.organizationId;
      if (!orgId) {
        const organization = await tx.organization.create({
          data: {
            name: `${data.name} Organization`,
          },
        });
        orgId = organization.id;
      }

      // 1. Create Business using transaction repo
      const { userId, ...businessData } = data;
      const businessRepoTx = new BusinessRepository(tx);
      const business = await businessRepoTx.create({
        ...businessData,
        organizationId: orgId,
      });
      
      // 2. Assign the creator as OWNER of this business if userId is provided
      if (userId) {
        await tx.userBusinessRole.create({
          data: {
            userId,
            businessId: business.id,
            role: 'OWNER',
          },
        });

        // Update the User's businessId to link them to the new business
        await tx.user.update({
          where: { id: userId },
          data: { businessId: business.id },
        });
      }
      
      // 3. Initialize mandatory accounting accounts within the transaction
      const accountingRepoTx = new AccountingRepository(tx);
      const accountingServiceTx = new AccountingService(accountingRepoTx);
      await accountingServiceTx.initializeSystemAccounts(business.id);
      
      // 4. Create default warehouse for the new business using env config within the transaction
      const { defaultWarehouseName } = env;
      const warehouseRepoTx = new WarehouseRepository(tx);
      const warehouseServiceTx = new WarehouseService(warehouseRepoTx);
      await warehouseServiceTx.createWarehouse({
        name: defaultWarehouseName || 'Main Warehouse',
        businessId: business.id,
      } as any);

      return business;
    });
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

  async updateBusiness(id: string, organizationId: string, data: UpdateBusinessDTO) {
    const business = await this.getBusinessById(id); // Ensure exists and not deleted
    if (business.organizationId !== organizationId) {
      throw new AppError('Forbidden: Business does not belong to your organization', 403);
    }
    return await this.businessRepo.update(id, data);
  }

  async deleteBusiness(id: string, organizationId: string) {
    const business = await this.getBusinessById(id); // Ensure exists and not deleted
    if (business.organizationId !== organizationId) {
      throw new AppError('Forbidden: Business does not belong to your organization', 403);
    }
    return await this.businessRepo.softDelete(id);
  }
}
