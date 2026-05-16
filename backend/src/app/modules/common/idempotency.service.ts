import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

export class IdempotencyService {
  /**
   * Check if an operation with a specific key has already been completed.
   * This is a generic way to prevent duplicate processing.
   */
  async checkAndLock(key: string, businessId: string, namespace: string) {
    // We can use the JournalEntry table or a dedicated table if available.
    // For now, let's use a pattern where we check if a JournalEntry or OutboxEvent with this key exists.
    
    // If it's for Accounting, we check JournalEntry eventId or idempotencyKey
    const existing = await prisma.journalEntry.findFirst({
      where: {
        businessId,
        OR: [
          { idempotencyKey: key },
          { eventId: key }
        ]
      }
    });

    if (existing) {
      return { isDuplicate: true, result: existing };
    }

    return { isDuplicate: false };
  }

  /**
   * Specifically for webhooks (e.g. Stripe, SSLCommerz)
   */
  async checkWebhook(externalId: string, provider: string) {
    const existing = await prisma.webhookEvent.findUnique({
      where: { externalId }
    });

    if (existing && existing.status === 'PROCESSED') {
      return true;
    }
    return false;
  }
}
