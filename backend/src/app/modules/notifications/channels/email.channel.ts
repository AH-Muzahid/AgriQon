import { logger } from '@/app/lib/logger';
import { env } from '@/config/env';
import { NotificationMessage } from '../notification.types';

/**
 * Mock Postmark Client for demonstration.
 * In production, replace with: import { ServerClient } from 'postmark';
 */
class MockPostmarkClient {
  async sendEmail(data: any) {
    logger.info('[EmailChannel] Mock Sending Email', data);
    return Promise.resolve();
  }
}

const client = new MockPostmarkClient();

export const sendEmail = async (message: NotificationMessage) => {
  try {
    await client.sendEmail({
      From: env.emailFrom,
      To: message.to,
      Subject: message.subject,
      HtmlBody: message.body,
    });
    logger.info(`Email successfully dispatched to ${message.to}`);
  } catch (error) {
    logger.error(`Failed to dispatch email to ${message.to}`, error);
    throw error;
  }
};
