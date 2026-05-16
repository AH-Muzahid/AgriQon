import { env } from '../../../config/env';
import { AiRepository } from './ai.repository';
import { prisma } from '../../lib/prisma';
import { subDays } from 'date-fns';
import { AiProvider } from './providers/base.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { retry } from '../../lib/retry';

export class AiService {
  private aiRepo: AiRepository;
  private primaryProvider: AiProvider;
  private fallbackProvider?: AiProvider;

  constructor() {
    this.aiRepo = new AiRepository();
    
    const geminiApiKey = env.geminiApiKey || '';
    const gemini = new GeminiProvider(geminiApiKey);
    const openai = env.openaiApiKey ? new OpenAIProvider(env.openaiApiKey) : undefined;

    if (env.aiProvider === 'openai' && openai) {
      this.primaryProvider = openai;
      this.fallbackProvider = gemini;
    } else {
      this.primaryProvider = gemini;
      this.fallbackProvider = openai;
    }
  }

  async logInteraction(businessId: string, userId: string | undefined, data: any) {
    return this.aiRepo.createLog({
      businessId,
      userId,
      type: data.type,
      prompt: data.prompt,
      response: data.response,
      contextData: data.contextData,
    });
  }

  /**
   * Sync item text with its vector embedding using primary or fallback provider
   */
  async updateItemEmbedding(businessId: string, itemId: string, text: string) {
    try {
      const vector = await this.executeWithFallback(
        (provider) => provider.generateEmbedding(text),
        'Embedding'
      );

      if (!vector) throw new Error('Failed to generate embedding vector');

      return this.aiRepo.upsertEmbedding({
        businessId,
        itemId,
        text,
        vector: vector as any,
      });
    } catch (error) {
      console.error('AI Embedding Final Error:', error);
      throw error; // Rethrow so worker can retry
    }
  }

  /**
   * Generates a response based on a prompt and context (RAG)
   */
  async generateChatResponse(businessId: string, prompt: string, userId?: string) {
    try {
      // 1. Get enriched business context
      const businessContext = await this.getEnrichedBusinessContext(businessId);

      // 2. Generate embedding for the prompt to find specific items
      let itemContext = "No specific items found for this query.";
      let similarities: any[] = [];

      try {
        const promptVector = await this.executeWithFallback(
          (provider) => provider.generateEmbedding(prompt),
          'PromptEmbedding'
        );

        if (promptVector) {
          similarities = await this.aiRepo.searchSimilarEmbeddings(businessId, promptVector, 5);
          if (similarities.length > 0) {
            itemContext = similarities.map((s: any) => s.text).join('\n---\n');
          }
        }
      } catch (embError) {
        console.warn('Vector search failed, falling back to business context only:', embError);
      }

      // 3. Generate response using the providers
      const context = `
CORE BUSINESS & MARKET CONTEXT:
-------------------------------------------
${businessContext}
-------------------------------------------

SPECIFIC ITEM DATA (Relevant to current query):
-------------------------------------------
${itemContext}
-------------------------------------------
      `;

      const responseText = await this.executeWithFallback(
        (provider) => provider.generateChatResponse(prompt, context),
        'ChatResponse'
      );

      // 4. Log the interaction for audit and quality tracking
      await this.logInteraction(businessId, userId, {
        type: 'CHAT',
        prompt,
        response: responseText,
        contextData: { 
          itemMatches: similarities.length, 
          hasBusinessContext: !!businessContext 
        },
      });

      return {
        response: responseText,
        contextSource: similarities.length > 0 ? 'vector-search' : 'business-info'
      };
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      return {
        response: "The AI service is temporarily unavailable. This could be due to rate limits or network issues. Please try again in a moment.",
        contextSource: 'error'
      };
    }
  }

  /**
   * Helper to execute AI operations with retry and provider fallback.
   */
  private async executeWithFallback<T>(
    operation: (provider: AiProvider) => Promise<T>,
    label: string
  ): Promise<T> {
    try {
      // Try primary with retry
      return await retry(() => operation(this.primaryProvider), {
        retries: 2,
        onRetry: (err, i) => console.warn(`AI Primary Provider (${label}) retry ${i}:`, err.message)
      });
    } catch (primaryError) {
      if (this.fallbackProvider) {
        console.warn(`AI Primary Provider (${label}) failed, attempting fallback...`);
        try {
          return await retry(() => operation(this.fallbackProvider!), {
            retries: 2,
            onRetry: (err, i) => console.warn(`AI Fallback Provider (${label}) retry ${i}:`, err.message)
          });
        } catch (fallbackError) {
          throw new Error(`AI Service Unavailable: Both providers failed (${label})`);
        }
      }
      throw primaryError;
    }
  }

  /**
   * Fetches enriched business context including inventory and sales summaries.
   */
  private async getEnrichedBusinessContext(businessId: string): Promise<string> {
    try {
      // Fetch basic business info
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          categories: { select: { name: true } },
          warehouses: { select: { name: true, location: true } }
        }
      });

      if (!business) return 'Business profile not found.';

      // Fetch Inventory Summary
      const inventoryStats = await prisma.inventory.aggregate({
        where: { businessId },
        _sum: { totalStock: true },
        _count: { id: true }
      });

      const lowStockCount = await prisma.item.count({
        where: { 
          businessId,
          inventory: {
            some: {
              totalStock: { lte: prisma.item.fields.lowStockThreshold as any }
            }
          }
        }
      });

      // Fetch Sales Summary (Last 30 Days)
      const thirtyDaysAgo = subDays(new Date(), 30);
      const salesStats = await prisma.order.aggregate({
        where: { 
          businessId, 
          createdAt: { gte: thirtyDaysAgo },
          status: 'COMPLETED'
        },
        _sum: { total: true },
        _count: { id: true }
      });

      const pendingOrdersCount = await prisma.order.count({
        where: { businessId, status: 'PENDING' }
      });

      const processingOrdersCount = await prisma.order.count({
        where: { businessId, status: { in: ['PROCESSING', 'SHIPPED'] } }
      });

      const topSellingItems = await prisma.orderItem.groupBy({
        by: ['itemId'],
        where: {
          businessId,
          order: { createdAt: { gte: thirtyDaysAgo }, status: 'COMPLETED' }
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 3
      });

      // Get names for top selling items
      const itemIds = topSellingItems.map((i: any) => i.itemId);
      const itemNames = await prisma.item.findMany({
        where: { id: { in: itemIds } },
        select: { id: true, title: true }
      });

      const topItemsStr = topSellingItems.map((ti: any) => {
        const item = itemNames.find((n: any) => n.id === ti.itemId);
        return `- ${item?.title || 'Unknown'}: ${ti._sum.quantity} units`;
      }).join('\n');

      return [
        `Business: ${business.name} (Currency: ${business.currency})`,
        `Categories: ${business.categories.map((c: any) => c.name).join(', ') || 'N/A'}`,
        `Location: ${business.address || 'N/A'}`,
        `\nINVENTORY SUMMARY:`,
        `- Total SKU Count: ${inventoryStats._count.id}`,
        `- Total Units in Stock: ${inventoryStats._sum.totalStock || 0}`,
        `- Low Stock Alerts: ${lowStockCount} items`,
        `\nORDER STATUS:`,
        `- Pending Orders: ${pendingOrdersCount}`,
        `- Processing/Shipped: ${processingOrdersCount}`,
        `\nSALES PERFORMANCE (Last 30 Days):`,
        `- Completed Orders: ${salesStats._count.id}`,
        `- Total Revenue: ${salesStats._sum.total || 0} ${business.currency}`,
        `- Top Selling Items:\n${topItemsStr || 'No sales data yet'}`
      ].join('\n');
    } catch (error) {
      console.warn('Failed to fetch enriched business context:', error);
      return 'Limited business context available due to data fetch error.';
    }
  }

  async getAiLogs(businessId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { items, total } = await this.aiRepo.findLogs(businessId, skip, limit);

    return {
      items,
      meta: { page, limit, total }
    };
  }

  /**
   * Constructs a descriptive text for an item to be used for embeddings.
   */
  constructItemText(item: any): string {
    const totalStock = item.inventory?.reduce((sum: number, inv: any) => sum + (inv.availableStock || inv.totalStock || 0), 0) || 0;

    return [
      `Product: ${item.title}`,
      item.description ? `Description: ${item.description}` : null,
      item.category ? `Category: ${item.category.name}` : null,
      item.brand ? `Brand: ${item.brand.name}` : null,
      item.sku ? `SKU: ${item.sku}` : null,
      `Price: ${item.price} per ${item.unit}`,
      `Stock Level: ${totalStock} ${item.unit}`,
      `ID: ${item.id}`
    ].filter(Boolean).join('\n');
  }
}
