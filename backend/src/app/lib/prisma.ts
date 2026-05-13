import { Prisma, PrismaClient } from '../../generated/client';
import { env } from '../../config/env';
import logger from './logger';

const SOFT_DELETE_MODELS = ['Business', 'User', 'Item', 'Customer', 'Order', 'Invoice'];

const prismaClientSingleton = () => {
  const basePrisma = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'info' },
      { emit: 'stdout', level: 'warn' },
    ],
  });

  // Rule 5: Log slow queries (>100ms)
  basePrisma.$on('query' as any, (e: any) => {
    if (e.duration > 100) {
      logger.warn(`Slow Query: ${e.query} - Duration: ${e.duration}ms`);
    }
  });

  const prisma = basePrisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, operation, args, query }) {
          if (SOFT_DELETE_MODELS.includes(model)) {
            if (args.where) {
              if ((args.where as any).deletedAt === undefined) {
                (args.where as any).deletedAt = null;
              }
            } else {
              args.where = { deletedAt: null } as any;
            }
          }
          return query(args);
        },
        async findFirst({ model, operation, args, query }) {
          if (SOFT_DELETE_MODELS.includes(model)) {
            if (args.where) {
              if ((args.where as any).deletedAt === undefined) {
                (args.where as any).deletedAt = null;
              }
            } else {
              args.where = { deletedAt: null } as any;
            }
          }
          return query(args);
        },
        async findUnique({ model, operation, args, query }) {
          return query(args);
        },
      },
    },
    model: {
      $allModels: {
        async softDelete<T, A>(
          this: T,
          args: Prisma.Exact<A, Prisma.Args<T, 'update'>>
        ): Promise<Prisma.Result<T, A, 'update'>> {
          return (this as any).update({
            ...(args as any),
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });

  return prisma as any;
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (env.nodeEnv !== 'production') globalThis.prisma = prisma;
