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
import { SupplierRoutes } from '../modules/suppliers/supplier.routes';
import { PurchaseRoutes } from '../modules/purchases/purchase.routes';
import { AccountingRoutes } from '../modules/accounting/accounting.routes';
import { LoyaltyRoutes } from '../modules/loyalty/loyalty.routes';
import { ReviewRoutes } from '../modules/reviews/review.routes';
import { AuditRoutes } from '../modules/audit/audit.routes';
import { AiRoutes } from '../modules/ai/ai.routes';
import { CategoryRoutes } from '../modules/categories/category.routes';
import { BrandRoutes } from '../modules/brands/brand.routes';
import { NotificationRoutes } from '../modules/notifications/notification.routes';
import { UploadsRoutes } from '../modules/uploads/uploads.routes';
import { ReportRoutes } from '../modules/reports/report.routes';
import { ReconciliationRoutes } from '../modules/reconciliation/reconciliation.routes';
import { PaymentRoutes } from '../modules/payments/payment.routes';
import { AnalyticsRoutes } from '../modules/analytics/analytics.routes';
import { OrganizationRoutes } from '../modules/organization/organization.routes';
import { RoleRoutes } from '../modules/roles/role.routes';
import { PermissionRoutes } from '../modules/permissions/permission.routes';
import { SubscriptionRoutes } from '../modules/subscriptions/subscription.routes';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/business', route: BusinessRoutes },
  { path: '/products', route: ProductRoutes },
  { path: '/categories', route: CategoryRoutes },
  { path: '/brands', route: BrandRoutes },
  { path: '/inventory', route: InventoryRoutes },
  { path: '/warehouses', route: WarehouseRoutes },
  { path: '/stock-movements', route: StockMovementRoutes },
  { path: '/customers', route: CustomerRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/invoices', route: InvoiceRoutes },
  { path: '/suppliers', route: SupplierRoutes },
  { path: '/purchases', route: PurchaseRoutes },
  { path: '/accounting', route: AccountingRoutes },
  { path: '/loyalty', route: LoyaltyRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/audit', route: AuditRoutes },
  { path: '/ai', route: AiRoutes },
  { path: '/notifications', route: NotificationRoutes },
  { path: '/uploads', route: UploadsRoutes },
  { path: '/reports', route: ReportRoutes },
  { path: '/reconciliation', route: ReconciliationRoutes },
  { path: '/dashboard', route: AnalyticsRoutes },
  { path: '/analytics', route: AnalyticsRoutes },
  { path: '/organization', route: OrganizationRoutes },
  { path: '/roles', route: RoleRoutes },
  { path: '/permissions', route: PermissionRoutes },
  { path: '/subscription', route: SubscriptionRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

import { SubscriptionController } from '../modules/subscriptions/subscription.controller';
router.post('/webhooks/payments/:gateway', SubscriptionController.postWebhook);

export default router;
