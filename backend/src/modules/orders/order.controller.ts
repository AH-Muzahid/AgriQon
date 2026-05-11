import type { Request, Response } from 'express';
import { createOrderSchema, updateOrderStatusSchema } from './order.schemas';
import { orderService } from './order.service';

export const orderController = {
  async create(req: Request, res: Response) {
    const payload = createOrderSchema.parse(req.body);
    const result = await orderService.create(req.user!.id, req.user!.businessId, payload.items);

    if (result.status === 'missing-item') {
      return res.status(400).json({ message: `Item not found: ${result.itemId}` });
    }

    return res.status(201).json(result.order);
  },

  async list(req: Request, res: Response) {
    return res.json(await orderService.list(req.user!.id, req.user!.role));
  },

  async updateStatus(req: Request, res: Response) {
    const payload = updateOrderStatusSchema.parse(req.body);
    return res.json(await orderService.updateStatus(req.params.id, payload.status));
  },
};
