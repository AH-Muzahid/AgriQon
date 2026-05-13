import { AiRepository } from './ai.repository';

export class AiService {
  private aiRepo: AiRepository;

  constructor() {
    this.aiRepo = new AiRepository();
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
   * Sync item text with its vector embedding
   * Placeholder for real LLM embedding call
   */
  async updateItemEmbedding(businessId: string, itemId: string, text: string) {
    // In a real app: const vector = await openai.embeddings.create({ input: text, ... })
    const mockVector = Array.from({ length: 1536 }, () => Math.random());

    return this.aiRepo.upsertEmbedding({
      businessId,
      itemId,
      text,
      vector: mockVector as any,
    });
  }

  async getAiLogs(businessId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { items, total } = await this.aiRepo.findLogs(businessId, skip, limit);

    return {
      items,
      meta: { page, limit, total }
    };
  }
}
