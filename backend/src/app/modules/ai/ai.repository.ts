import { Prisma, AiLog, Embedding } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class AiRepository {
  private prisma: Prisma.TransactionClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = tx || prisma;
  }

  async createLog(data: Prisma.AiLogUncheckedCreateInput): Promise<AiLog> {
    return this.prisma.aiLog.create({
      data,
    });
  }

  async upsertEmbedding(data: Prisma.EmbeddingUncheckedCreateInput): Promise<Embedding> {
    return this.prisma.embedding.upsert({
      where: { itemId: data.itemId },
      update: {
        vector: data.vector,
        text: data.text,
      },
      create: data,
    });
  }

  async findLogs(businessId: string, skip: number, take: number) {
    const [items, total] = await Promise.all([
      this.prisma.aiLog.findMany({
        where: { businessId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } }
        }
      }),
      this.prisma.aiLog.count({ where: { businessId } })
    ]);
    return { items, total };
  }

  async findEmbeddingByItem(itemId: string): Promise<Embedding | null> {
    return this.prisma.embedding.findUnique({
      where: { itemId },
    });
  }
}
