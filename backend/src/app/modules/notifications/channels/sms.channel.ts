import { logger } from '../../../lib/logger';
import { env } from '../../../../config/env';
import { NotificationMessage } from '../notification.types';

/**
 * Mock SMS Client (e.g. Twilio or local provider)
 */
class MockSmsClient {
  async sendSms(data: { to: string; body: string }) {
    logger.info('[SmsChannel] Mock Sending SMS', data);
    return Promise.resolve();
  }
}

const client = new MockSmsClient();

export const sendSms = async (message: NotificationMessage) => {
  if (!message.to) {
    logger.warn('[SmsChannel] Skipping SMS: No phone number provided');
    return;
  }

  try {
    await client.sendSms({
      to: message.to,
      body: message.body,
    });
    logger.info(`SMS successfully dispatched to ${message.to}`);
  } catch (error) {
    logger.error(`Failed to dispatch SMS to ${message.to}`, error);
    throw error;
  }
};
