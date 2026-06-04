import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError';

/**
 * Middleware to ensure the request is scoped to a business (multi‑tenant).
 * It expects `req.businessId` to be set by authentication middleware.
 * If missing, responds with 400 Bad Request.
 */
export function requireBusiness(req: Request, res: Response, next: NextFunction) {
  const businessId = (req as any).businessId;
  if (!businessId) {
    // Redirect to onboarding page if business context is missing
    return res.redirect('/onboarding');
  }
  // Attach to locals for downstream usage if needed
  res.locals.businessId = businessId;
  return next();
}
