import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

// Rule 5: Log slow queries (>100ms)
prisma.$on('query' as any, (e: any) => {
  if (e.duration > 100) {
    logger.warn(`Slow Query: ${e.query} - Duration: ${e.duration}ms`);
  }
});
