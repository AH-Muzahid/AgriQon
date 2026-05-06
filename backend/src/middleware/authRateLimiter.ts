import rateLimit from 'express-rate-limit';

// Stricter limits for auth endpoints to mitigate brute-force and abuse
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Slightly different limiter for OAuth callback (may be invoked by third-party)
export const oauthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // limit to 30 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
});

export default authLimiter;
