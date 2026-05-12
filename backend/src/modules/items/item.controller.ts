import type { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { createItemSchema, itemQuerySchema, updateItemSchema } from './item.schemas';
import { itemService } from './item.service';

export const itemController = {
  async list(req: Request, res: Response) {
    const query = itemQuerySchema.parse(req.query);
    return res.json(await itemService.list(query, req.user?.id, req.user?.businessId || undefined));
  },

  async get(req: Request, res: Response) {
    const item = await itemService.findById(req.params.id, req.user?.id, req.user?.businessId || undefined);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    return res.json(item);
  },

  async create(req: Request, res: Response) {
    const payload = createItemSchema.parse(req.body);
    const item = await itemService.create(req.user!.id, req.user!.businessId!, payload);
    return res.status(201).json(item);
  },

  async update(req: Request, res: Response) {
    const payload = updateItemSchema.parse(req.body);
    const result = await itemService.update(req.params.id, req.user!.id, req.user!.businessId!, req.user!.role === Role.ADMIN, payload);

    if (result.status === 'not-found') return res.status(404).json({ message: 'Item not found' });
    if (result.status === 'forbidden') return res.status(403).json({ message: 'Only the owner or admin can update this item' });

    return res.json(result.item);
  },

  async remove(req: Request, res: Response) {
    const result = await itemService.remove(req.params.id, req.user!.id, req.user!.businessId!, req.user!.role === Role.ADMIN);

    if (result === 'not-found') return res.status(404).json({ message: 'Item not found' });
    if (result === 'forbidden') return res.status(403).json({ message: 'Only the owner or admin can delete this item' });

    return res.status(204).send();
  },
};
