/**
 * Notification Types
 * ──────────────────────────────────────────────────────────────────────────
 * Pure type definitions — no business logic here.
 * The NotificationService constructs these objects from domain event payloads.
 */

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS   = 'SMS',
  PUSH  = 'PUSH',
}

/** The atomic unit handed to a channel driver for delivery. */
export interface NotificationMessage {
  to: string;                       // email address, phone number, or device token
  subject?: string;                 // email subject / push title
  body: string;                     // rendered plain-text body
  htmlBody?: string;                // optional HTML version for email
  channel: NotificationChannel;
  metadata?: Record<string, unknown>; // arbitrary extra fields for the driver
}

/** Returned by every channel driver. Logged for audit + retry tracking. */
export interface NotificationResult {
  channel: NotificationChannel;
  to: string;
  success: boolean;
  error?: string;
  providerMessageId?: string;
}
