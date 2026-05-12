import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { BusinessRoutes } from '../modules/business/business.routes';
import { ProductRoutes } from '../modules/products/product.routes';
import { InventoryRoutes } from '../modules/inventory/inventory.routes';
import { WarehouseRoutes } from '../modules/warehouse/warehouse.routes';
import { StockMovementRoutes } from '../modules/stock-movements/stock-movement.routes';
import { CustomerRoutes } from '../modules/customers/customer.routes';
import { OrderRoutes } from '../modules/orders/order.routes';
import { InvoiceRoutes } from '../modules/invoices/invoice.routes';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/business', route: BusinessRoutes },
  { path: '/products', route: ProductRoutes },
  { path: '/inventory', route: InventoryRoutes },
  { path: '/warehouses', route: WarehouseRoutes },
  { path: '/stock-movements', route: StockMovementRoutes },
  { path: '/customers', route: CustomerRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/invoices', route: InvoiceRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
