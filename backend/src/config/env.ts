import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET ?? 'test_fallback_secret_agroai_market_2026';
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: jwtSecret,
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET ?? '',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  // Email Configs
  emailFrom: process.env.EMAIL_FROM ?? 'noreply@agriqon.ai',
  postmarkKey: process.env.POSTMARK_KEY ?? 'mock-key',
  // Redis Config
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  aiProvider: (process.env.AI_PROVIDER as 'gemini' | 'openai') ?? 'gemini',
  // New: default warehouse name
  defaultWarehouseName: process.env.DEFAULT_WAREHOUSE_NAME ?? 'Main Warehouse',
  // Subscription trial duration config
  subscriptionTrialDays: Number(process.env.SUBSCRIPTION_TRIAL_DAYS ?? 14),
  subscriptionGraceDays: Number(process.env.SUBSCRIPTION_GRACE_DAYS ?? 7),
};
