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
app.use(cookieParser());
app.use(csurf({ cookie: { key: '_csrf', httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' } }));
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
