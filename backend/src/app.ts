import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { extractAuth } from './middleware/rbac';
import { authRouter } from './modules/auth/auth.routes';
import { itemRouter } from './modules/items/item.routes';
import { orderRouter } from './modules/orders/order.routes';
import { reviewRouter } from './modules/reviews/review.routes';
import { aiRouter } from './modules/ai/ai.routes';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
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

app.use('/api/auth', authRouter);
app.use('/api/items', itemRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/ai', aiRouter);

app.use(notFound);
app.use(errorHandler);
