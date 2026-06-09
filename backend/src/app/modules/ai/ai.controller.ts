import { Request, Response } from 'express';
import { AiService } from './ai.service';
import { sendResponse } from '../../shared/utils/sendResponse';
import { asyncHandler } from '../../../middleware/asyncHandler';

export class AiController {
  constructor(private aiService: AiService) {}

  getAiLogs = asyncHandler(async (req: Request, res: Response) => {
    const businessId = (req as any).user.businessId;
    const userId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await this.aiService.getAiLogs(businessId, Number(page), Number(limit), userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'AI logs retrieved successfully',
      data: result.items,
      meta: result.meta,
    });
  });

  syncItemEmbedding = asyncHandler(async (req: Request, res: Response) => {
    const businessId = (req as any).user.businessId;
    const { itemId, text } = req.body;

    const result = await this.aiService.updateItemEmbedding(businessId, itemId, text);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Item embedding synced successfully',
      data: result,
    });
  });

  generateChat = asyncHandler(async (req: Request, res: Response) => {
    const { prompt } = req.body;
    const businessId = (req as any).user.businessId;
    const userId = (req as any).user.id;

    const result = await this.aiService.generateChatResponse(businessId, prompt, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'AI response generated',
      data: {
        content: result.response,
        source: result.contextSource,
      },
    });
  });
}
