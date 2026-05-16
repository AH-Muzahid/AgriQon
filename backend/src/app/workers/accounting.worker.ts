import { BaseWorker } from './base.worker';
import { AccountingService } from '../modules/accounting/accounting.service';

export class AccountingWorker extends BaseWorker {
  private accountingService: AccountingService;

  constructor() {
    super('AccountingWorker');
    this.accountingService = new AccountingService();
  }

  protected async handleEvent(event: any): Promise<void> {
    console.log(`[AccountingWorker] Processing event: ${event.eventType} for aggregate: ${event.aggregateType}`);

    switch (event.eventType) {
      case 'order-created':
        await this.accountingService.handleOrderCreated(event.payload, event.id);
        break;
      
      case 'payment-completed':
        await this.accountingService.handlePaymentCompleted(event.payload, event.id);
        break;

      case 'purchase-received':
        await this.accountingService.handlePurchaseReceived(event.payload, event.id);
        break;

      case 'inventory-deducted':
        await this.accountingService.handleInventoryDeducted(event.payload, event.id);
        break;

      default:
        // Many events might not need accounting entries, just skip them
        break;
    }
  }
}
