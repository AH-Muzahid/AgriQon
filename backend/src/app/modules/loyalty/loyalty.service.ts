import { LoyaltyRepository } from './loyalty.repository';
import { AppError } from '../../errors/AppError';

export class LoyaltyService {
  private loyaltyRepository: LoyaltyRepository;

  constructor() {
    this.loyaltyRepository = new LoyaltyRepository();
  }

  async createOrUpdateProgram(businessId: string, data: any) {
    const existing = await this.loyaltyRepository.findProgramByBusiness(businessId);
    if (existing) {
      // Update logic could be here
      return existing;
    }
    return this.loyaltyRepository.createProgram({
      ...data,
      businessId,
    });
  }

  async awardPointsForPurchase(businessId: string, customerId: string, amount: number) {
    const program = await this.loyaltyRepository.findProgramByBusiness(businessId);
    if (!program || !program.isActive) return null;

    // Default: 1 point per 100 units of currency
    const pointsPerUnit = program.pointsPerUnit ? Number(program.pointsPerUnit) : 0.01;
    const pointsToAward = Math.floor(amount * pointsPerUnit);

    if (pointsToAward <= 0) return null;

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Points expire in 1 year

    return this.loyaltyRepository.addPoints({
      businessId,
      customerId,
      points: pointsToAward,
      reason: 'Purchase reward',
      expiresAt,
    });
  }

  async getCustomerBalance(customerId: string, businessId: string) {
    return this.loyaltyRepository.getCustomerPoints(customerId, businessId);
  }
}
