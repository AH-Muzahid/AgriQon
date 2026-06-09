import './email.worker';
import './accounting.worker';
import './notification.worker';
import './report.worker';
import './inventory.worker';
import './customer.worker';
import './ai.worker';
import './search.worker';
import './subscription-lifecycle.job';
import { setupReconciliationSchedules } from './reconciliation.worker';
import { setupSubscriptionLifecycleSchedules } from './subscription-lifecycle.job';
import { reconciliationQueue, subscriptionQueue } from '../app/lib/bullmq';

export const startWorkers = () => {
  console.log('[Workers] All background workers initialized.');
  
  // Setup scheduled jobs
  setupReconciliationSchedules(reconciliationQueue).catch(err => {
    console.error('[Workers] Failed to setup reconciliation schedules:', err);
  });

  setupSubscriptionLifecycleSchedules(subscriptionQueue).catch(err => {
    console.error('[Workers] Failed to setup subscription lifecycle schedules:', err);
  });
};
