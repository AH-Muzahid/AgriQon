import express from 'express';
import { StockMovementController } from './stock-movement.controller';
import { auth } from '../../middleware/auth.middleware';
import { Role } from '../../../generated/client';

const router = express.Router();

router.get(
  '/',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER, Role.SELLER),
  StockMovementController.getMovements
);

export const StockMovementRoutes = router;
