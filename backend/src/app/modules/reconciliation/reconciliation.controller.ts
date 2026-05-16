import { Request, Response } from 'express';
import { ReconciliationService } from './reconciliation.service';

export class ReconciliationController {
  private reconciliationService: ReconciliationService;

  constructor() {
    this.reconciliationService = new ReconciliationService();
  }

  async checkIntegrity(req: Request, res: Response) {
    const businessId = req.params.businessId;
    const results = await this.reconciliationService.runFullReconciliation(businessId);
    
    const isHealthy = results.every(r => r.status !== 'FAIL');

    res.json({
      success: true,
      businessId,
      isHealthy,
      results
    });
  }

  async globalCheck(req: Request, res: Response) {
    const results = await this.reconciliationService.runGlobalReconciliation();
    
    res.json({
      success: true,
      results
    });
  }

  async fixInventory(req: Request, res: Response) {
    const { businessId, inventoryId } = req.body;
    const result = await this.reconciliationService.fixInventoryDrift(businessId, inventoryId);
    res.json({
      success: true,
      message: 'Inventory drift fixed successfully.',
      data: result,
    });
  }

  async fixAccount(req: Request, res: Response) {
    const { businessId, accountId } = req.body;
    const result = await this.reconciliationService.fixAccountBalance(businessId, accountId);
    res.json({
      success: true,
      message: 'Account balance fixed successfully.',
      data: result,
    });
  }

  async getHistory(req: Request, res: Response) {
    const businessId = req.query.businessId as string;
    const history = await this.reconciliationService.getHistory(businessId);
    res.json({
      success: true,
      history
    });
  }

  async retryOutbox(req: Request, res: Response) {
    const { businessId, olderThanHours } = req.body;
    const result = await this.reconciliationService.retryStaleOutboxEvents(businessId, olderThanHours);
    res.json({
      success: true,
      message: 'Stale outbox events identified.',
      data: result
    });
  }
}
