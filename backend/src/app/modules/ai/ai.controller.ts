import { Request, Response } from 'express';
import { AiService } from './ai.service';
import { sendResponse } from '../../shared/utils/sendResponse';
import { asyncHandler } from '../../../middleware/asyncHandler';

const aiService = new AiService();

const getAiLogs = asyncHandler(async (req: Request, res: Response) => {
  const businessId = (req as any).user.businessId;
  const { page = 1, limit = 10 } = req.query;

  const result = await aiService.getAiLogs(businessId, Number(page), Number(limit));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AI logs retrieved successfully',
    data: result.items,
    meta: result.meta,
  });
});

const syncItemEmbedding = asyncHandler(async (req: Request, res: Response) => {
  const businessId = (req as any).user.businessId;
  const { itemId, text } = req.body;

  const result = await aiService.updateItemEmbedding(businessId, itemId, text);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Item embedding synced successfully',
    data: result,
  });
});

const generateChat = asyncHandler(async (req: Request, res: Response) => {
  const { prompt } = req.body;
  const businessId = (req as any).user.businessId;
  const userId = (req as any).user.id;

  const result = await aiService.generateChatResponse(businessId, prompt, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AI response generated',
    data: result.response,
  });
});

export const AiController = {
  getAiLogs,
  syncItemEmbedding,
  generateChat,
};
