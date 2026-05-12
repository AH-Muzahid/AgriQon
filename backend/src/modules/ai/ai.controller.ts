import type { Request, Response } from 'express';
import { aiChatSchema, aiSearchSchema } from './ai.schemas';
import { aiService } from './ai.service';

export const aiController = {
  async search(req: Request, res: Response) {
    const payload = aiSearchSchema.parse(req.body);
    return res.json(await aiService.semanticSearch(payload.query, payload.limit, req.user?.id, req.user?.businessId || undefined));
  },

  async chat(req: Request, res: Response) {
    const payload = aiChatSchema.parse(req.body);
    return res.json(await aiService.chat(payload.question, req.user?.id, req.user?.businessId || undefined));
  },
};
