import { prisma } from '../../lib/prisma';
import { withRLS } from '../../lib/prisma.utils';

export const aiService = {
  async semanticSearch(query: string, limit: number, userId?: string, businessId?: string) {
    return await withRLS({ userId, businessId }, async (tx) => {
      const keywords = query.split(/\s+/).filter(Boolean);
      const items = await tx.item.findMany({
        where: {
          OR: keywords.flatMap((keyword) => [
            { title: { contains: keyword, mode: 'insensitive' as const } },
            { description: { contains: keyword, mode: 'insensitive' as const } },
            { category: { name: { contains: keyword, mode: 'insensitive' as const } } },
          ]),
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { business: { select: { id: true, name: true } } },
      });

      if (businessId) {
        await tx.aiLog.create({
          data: {
            userId,
            businessId,
            type: 'semantic_search',
            prompt: query,
            response: JSON.stringify({ count: items.length }),
          },
        });
      }

      return {
        mode: 'keyword-fallback',
        message: 'Vector embeddings can plug in here with pgvector or Pinecone.',
        results: items,
      };
    });
  },

  async chat(question: string, userId?: string, businessId?: string) {
    return await withRLS({ userId, businessId }, async (tx) => {
      const contextItems = await tx.item.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { 
          title: true, 
          category: { select: { name: true } }, 
          price: true, 
          unit: true 
        },
      });

      const answer =
        contextItems.length > 0
          ? `Based on current marketplace data, compare freshness, stock, seller reliability, and price before buying. Relevant products: ${contextItems
              .map((item) => `${item.title} (${item.category?.name}, ${item.price}/${item.unit})`)
              .join(', ')}.`
          : 'Marketplace data is empty. Add products first, then connect an LLM provider for richer RAG answers.';

      if (businessId) {
        await tx.aiLog.create({
          data: {
            userId,
            businessId,
            type: 'rag_chat',
            prompt: question,
            response: answer,
          },
        });
      }

      return {
        answer,
        provider: 'local-placeholder',
        nextStep: 'Add Gemini/OpenAI API key and replace this response with retrieved-context generation.',
      };
    });
  },
};
