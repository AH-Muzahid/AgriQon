import Redis from 'ioredis';
import { env } from '../../config/env';

const redisConfig = {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
};
export { redisConfig };
export const redis = new Redis(env.redisUrl, redisConfig);

redis.on('connect', () => {
  console.log('[Redis] Connected to ' + env.redisUrl);
});

redis.on('error', (err) => {
  console.error('[Redis] Connection Error:', err);
});
