import { Role } from '@prisma/client';
import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { itemController } from './item.controller';

export const itemRouter = Router();

itemRouter.get('/', asyncHandler(itemController.list));
itemRouter.get('/:id', asyncHandler(itemController.get));
itemRouter.post('/', authenticate, authorize(Role.SELLER, Role.ADMIN), asyncHandler(itemController.create));
itemRouter.patch('/:id', authenticate, authorize(Role.SELLER, Role.ADMIN), asyncHandler(itemController.update));
itemRouter.delete('/:id', authenticate, authorize(Role.SELLER, Role.ADMIN), asyncHandler(itemController.remove));
