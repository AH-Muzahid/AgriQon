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

  /**
   * Vector similarity search using cosine distance
   * Note: This assumes pgvector is available if we use the <=> operator.
   * If not, this is a placeholder for actual vector search logic.
   */
  async searchSimilarEmbeddings(businessId: string, vector: number[], limit: number = 5) {
    const vectorString = `[${vector.join(',')}]`;
    
    // Using raw SQL for vector similarity search
    // We use cosine distance (<=>) from pgvector extension
    try {
      const results = await (this.prisma as any).$queryRawUnsafe(`
        SELECT "itemId", "text", 
        (1 - (CAST(vector AS text)::vector <=> $1::vector)) as similarity
        FROM "Embedding"
        WHERE "businessId" = $2
        ORDER BY CAST(vector AS text)::vector <=> $1::vector
        LIMIT $3
      `, vectorString, businessId, limit) as any[];

      return results;
    } catch (error: any) {
      // Fallback if pgvector is not installed
      console.error('Vector search failed, falling back to simple text match or empty context:', error.message);
      return [];
    }
  }

  /**
   * Counts items in a business that do not have an associated embedding
   */
  async countItemsWithoutEmbeddings(businessId: string): Promise<number> {
    return prisma.item.count({
      where: {
        businessId,
        embedding: { is: null },
        deletedAt: null
      }
    });
  }

  /**
   * Fetches a batch of items that are missing embeddings
   */
  async getItemsWithoutEmbeddings(businessId: string, limit: number = 50) {
    return prisma.item.findMany({
      where: {
        businessId,
        embedding: { is: null },
        deletedAt: null
      },
      take: limit,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } }
      }
    });
  }
}
