
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.0.1
 * Query Engine version: 5dbef10bdbfb579e07d35cc85fb1518d357cb99e
 */
Prisma.prismaVersion = {
  client: "6.0.1",
  engine: "5dbef10bdbfb579e07d35cc85fb1518d357cb99e"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  email: 'email',
  phone: 'phone',
  address: 'address',
  website: 'website',
  logo: 'logo',
  taxNumber: 'taxNumber',
  currency: 'currency',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  role: 'role',
  businessId: 'businessId',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  token: 'token',
  userId: 'userId',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  revokedAt: 'revokedAt',
  replacedBy: 'replacedBy'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  parentId: 'parentId'
};

exports.Prisma.BrandScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name'
};

exports.Prisma.ItemScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  categoryId: 'categoryId',
  brandId: 'brandId',
  title: 'title',
  description: 'description',
  sku: 'sku',
  barcode: 'barcode',
  price: 'price',
  costPrice: 'costPrice',
  unit: 'unit',
  hasBatches: 'hasBatches',
  isService: 'isService',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductBatchScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  itemId: 'itemId',
  batchNumber: 'batchNumber',
  expiryDate: 'expiryDate',
  createdAt: 'createdAt'
};

exports.Prisma.WarehouseScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  location: 'location'
};

exports.Prisma.InventoryScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  itemId: 'itemId',
  warehouseId: 'warehouseId',
  batchId: 'batchId',
  availableStock: 'availableStock',
  reservedStock: 'reservedStock',
  totalStock: 'totalStock',
  version: 'version',
  updatedAt: 'updatedAt'
};

exports.Prisma.StockMovementScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  inventoryId: 'inventoryId',
  type: 'type',
  quantity: 'quantity',
  reference: 'reference',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.WarehouseTransferScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  sourceId: 'sourceId',
  destinationId: 'destinationId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StockReservationScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  inventoryId: 'inventoryId',
  orderId: 'orderId',
  quantity: 'quantity',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.CustomerScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  email: 'email',
  phone: 'phone',
  address: 'address',
  loyaltyPoints: 'loyaltyPoints',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  customerId: 'customerId',
  userId: 'userId',
  status: 'status',
  paymentStatus: 'paymentStatus',
  idempotencyKey: 'idempotencyKey',
  total: 'total',
  taxAmount: 'taxAmount',
  discount: 'discount',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  orderId: 'orderId',
  itemId: 'itemId',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  discount: 'discount',
  tax: 'tax'
};

exports.Prisma.SupplierScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  contact: 'contact',
  email: 'email',
  phone: 'phone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PurchaseOrderScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  supplierId: 'supplierId',
  status: 'status',
  total: 'total',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PurchaseItemScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  purchaseOrderId: 'purchaseOrderId',
  itemId: 'itemId',
  quantity: 'quantity',
  unitCost: 'unitCost'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  type: 'type',
  code: 'code',
  balance: 'balance'
};

exports.Prisma.LedgerEntryScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  accountId: 'accountId',
  userId: 'userId',
  debit: 'debit',
  credit: 'credit',
  description: 'description',
  reference: 'reference',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  metadata: 'metadata',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  customerId: 'customerId',
  orderId: 'orderId',
  invoiceNumber: 'invoiceNumber',
  totalAmount: 'totalAmount',
  paidAmount: 'paidAmount',
  dueAmount: 'dueAmount',
  dueDate: 'dueDate',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  orderId: 'orderId',
  amount: 'amount',
  method: 'method',
  status: 'status',
  transactionId: 'transactionId',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  userId: 'userId',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  previousData: 'previousData',
  newData: 'newData',
  changedFields: 'changedFields',
  createdAt: 'createdAt'
};

exports.Prisma.AiLogScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  userId: 'userId',
  type: 'type',
  prompt: 'prompt',
  response: 'response',
  contextData: 'contextData',
  createdAt: 'createdAt'
};

exports.Prisma.WebhookEventScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  gateway: 'gateway',
  eventType: 'eventType',
  payload: 'payload',
  processingStatus: 'processingStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OutboxEventScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  aggregateType: 'aggregateType',
  aggregateId: 'aggregateId',
  eventType: 'eventType',
  payload: 'payload',
  isProcessed: 'isProcessed',
  createdAt: 'createdAt'
};

exports.Prisma.EmbeddingScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  vector: 'vector',
  text: 'text',
  createdAt: 'createdAt',
  businessId: 'businessId'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  rating: 'rating',
  comment: 'comment',
  userId: 'userId',
  itemId: 'itemId',
  createdAt: 'createdAt'
};

exports.Prisma.LoyaltyProgramScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  pointsPerUnit: 'pointsPerUnit',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoyaltyPointScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  customerId: 'customerId',
  points: 'points',
  reason: 'reason',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  USER: 'USER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  ACCOUNTANT: 'ACCOUNTANT',
  WAREHOUSE_KEEPER: 'WAREHOUSE_KEEPER'
};

exports.MovementType = exports.$Enums.MovementType = {
  IN: 'IN',
  OUT: 'OUT',
  TRANSFER: 'TRANSFER',
  ADJUSTMENT: 'ADJUSTMENT',
  RETURN: 'RETURN'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

exports.PurchaseStatus = exports.$Enums.PurchaseStatus = {
  PENDING: 'PENDING',
  ORDERED: 'ORDERED',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED'
};

exports.AccountType = exports.$Enums.AccountType = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  EQUITY: 'EQUITY',
  REVENUE: 'REVENUE',
  EXPENSE: 'EXPENSE'
};

exports.ProcessingStatus = exports.$Enums.ProcessingStatus = {
  PENDING: 'PENDING',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED'
};

exports.Prisma.ModelName = {
  Organization: 'Organization',
  Business: 'Business',
  User: 'User',
  RefreshToken: 'RefreshToken',
  Category: 'Category',
  Brand: 'Brand',
  Item: 'Item',
  ProductBatch: 'ProductBatch',
  Warehouse: 'Warehouse',
  Inventory: 'Inventory',
  StockMovement: 'StockMovement',
  WarehouseTransfer: 'WarehouseTransfer',
  StockReservation: 'StockReservation',
  Customer: 'Customer',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Supplier: 'Supplier',
  PurchaseOrder: 'PurchaseOrder',
  PurchaseItem: 'PurchaseItem',
  Account: 'Account',
  LedgerEntry: 'LedgerEntry',
  Notification: 'Notification',
  Invoice: 'Invoice',
  Payment: 'Payment',
  AuditLog: 'AuditLog',
  AiLog: 'AiLog',
  WebhookEvent: 'WebhookEvent',
  OutboxEvent: 'OutboxEvent',
  Embedding: 'Embedding',
  Review: 'Review',
  LoyaltyProgram: 'LoyaltyProgram',
  LoyaltyPoint: 'LoyaltyPoint'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
