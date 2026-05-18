import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { notFound } from './middleware/notFound';
import { extractAuth } from './middleware/rbac';
import router from './app/routes';
import globalErrorHandler from './app/middleware/error.middleware';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static('uploads'));
app.use(cookieParser());
const csrfProtection = csurf({
  cookie: {
    key: '_csrf',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  },
});

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (
    req.path.startsWith('/api/v1/auth') ||
    req.path === '/health' ||
    req.headers.authorization?.startsWith('Bearer ')
  ) {
    return next();
  }
  return csrfProtection(req, res, next);
});
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 150,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Extract authentication from JWT
app.use(extractAuth);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'agriqon-api' }));

// API Routes
app.use('/api/v1', router);

// Error Handling
app.use(notFound);
app.use(globalErrorHandler);
