
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
  familyId: 'familyId',
  userId: 'userId',
  userAgent: 'userAgent',
  ipAddress: 'ipAddress',
  expiresAt: 'expiresAt',
  lastUsedAt: 'lastUsedAt',
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
  lowStockThreshold: 'lowStockThreshold',
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
  location: 'location',
  isDefault: 'isDefault'
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
  itemId: 'itemId',
  type: 'type',
  quantity: 'quantity',
  unitCost: 'unitCost',
  reference: 'reference',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.InventoryValuationScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  itemId: 'itemId',
  valuationDate: 'valuationDate',
  quantity: 'quantity',
  unitCost: 'unitCost',
  totalValue: 'totalValue',
  method: 'method',
  reference: 'reference'
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

exports.Prisma.WarehouseTransferItemScalarFieldEnum = {
  id: 'id',
  transferId: 'transferId',
  itemId: 'itemId',
  batchId: 'batchId',
  quantity: 'quantity'
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
  pointsRedeemed: 'pointsRedeemed',
  pointsEarned: 'pointsEarned',
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
  systemType: 'systemType',
  balance: 'balance'
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

exports.Prisma.RefundScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  paymentId: 'paymentId',
  amount: 'amount',
  reason: 'reason',
  status: 'status',
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
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  requestId: 'requestId',
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

exports.Prisma.OutboxEventScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  aggregateType: 'aggregateType',
  aggregateId: 'aggregateId',
  eventType: 'eventType',
  payload: 'payload',
  status: 'status',
  attempts: 'attempts',
  lastError: 'lastError',
  nextAttemptAt: 'nextAttemptAt',
  lockedAt: 'lockedAt',
  lockId: 'lockId',
  processedAt: 'processedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
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

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  key: 'key',
  description: 'description'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  id: 'id',
  businessRole: 'businessRole',
  permissionId: 'permissionId'
};

exports.Prisma.UserBusinessRoleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  businessId: 'businessId',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoyaltyProgramScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  pointsPerUnit: 'pointsPerUnit',
  redemptionValuePerPoint: 'redemptionValuePerPoint',
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

exports.Prisma.WebhookEventScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  provider: 'provider',
  externalId: 'externalId',
  payload: 'payload',
  status: 'status',
  attempts: 'attempts',
  lastError: 'lastError',
  nextAttemptAt: 'nextAttemptAt',
  processingAt: 'processingAt',
  processedAt: 'processedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JournalEntryScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  date: 'date',
  description: 'description',
  reference: 'reference',
  source: 'source',
  isBalanced: 'isBalanced',
  status: 'status',
  postedAt: 'postedAt',
  postedById: 'postedById',
  eventId: 'eventId',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JournalLineScalarFieldEnum = {
  id: 'id',
  journalEntryId: 'journalEntryId',
  accountId: 'accountId',
  debit: 'debit',
  credit: 'credit',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.ReconciliationLogScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  runDate: 'runDate',
  status: 'status',
  summary: 'summary',
  results: 'results',
  isSystem: 'isSystem'
};

exports.Prisma.ReportCacheScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  reportType: 'reportType',
  parameters: 'parameters',
  data: 'data',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionPlanScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  isTrial: 'isTrial',
  maxUsers: 'maxUsers',
  maxProducts: 'maxProducts',
  maxWarehouses: 'maxWarehouses',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlanFeatureScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  featureKey: 'featureKey',
  value: 'value',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  planId: 'planId',
  status: 'status',
  startsAt: 'startsAt',
  trialEndsAt: 'trialEndsAt',
  expiresAt: 'expiresAt',
  graceEndsAt: 'graceEndsAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UsageMetricScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  metricKey: 'metricKey',
  value: 'value',
  limit: 'limit',
  resetAt: 'resetAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionEventScalarFieldEnum = {
  id: 'id',
  subscriptionId: 'subscriptionId',
  eventType: 'eventType',
  payload: 'payload',
  createdAt: 'createdAt'
};

exports.Prisma.CustomRoleScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  description: 'description',
  permissions: 'permissions',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserCustomRoleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  customRoleId: 'customRoleId',
  createdAt: 'createdAt'
};

exports.Prisma.SubscriptionInvoiceScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  subscriptionId: 'subscriptionId',
  invoiceNumber: 'invoiceNumber',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  dueDate: 'dueDate',
  paidAt: 'paidAt',
  createdAt: 'createdAt'
};

exports.Prisma.SubscriptionPaymentScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  invoiceId: 'invoiceId',
  amount: 'amount',
  method: 'method',
  transactionReference: 'transactionReference',
  status: 'status',
  createdAt: 'createdAt',
  gateway: 'gateway',
  gatewayPaymentId: 'gatewayPaymentId',
  gatewayTransactionId: 'gatewayTransactionId',
  webhookReceivedAt: 'webhookReceivedAt',
  verifiedAt: 'verifiedAt',
  idempotencyKey: 'idempotencyKey'
};

exports.Prisma.PaymentWebhookEventScalarFieldEnum = {
  id: 'id',
  gateway: 'gateway',
  externalEventId: 'externalEventId',
  payload: 'payload',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.SubscriptionChangeRequestScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  subscriptionId: 'subscriptionId',
  type: 'type',
  requestedPlanCode: 'requestedPlanCode',
  status: 'status',
  requestedAt: 'requestedAt',
  processedAt: 'processedAt'
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

exports.Prisma.OrganizationOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.BusinessOrderByRelevanceFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  email: 'email',
  phone: 'phone',
  address: 'address',
  website: 'website',
  logo: 'logo',
  taxNumber: 'taxNumber',
  currency: 'currency'
};

exports.Prisma.UserOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  businessId: 'businessId'
};

exports.Prisma.RefreshTokenOrderByRelevanceFieldEnum = {
  id: 'id',
  token: 'token',
  familyId: 'familyId',
  userId: 'userId',
  userAgent: 'userAgent',
  ipAddress: 'ipAddress',
  replacedBy: 'replacedBy'
};

exports.Prisma.CategoryOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  parentId: 'parentId'
};

exports.Prisma.BrandOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name'
};

exports.Prisma.ItemOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  categoryId: 'categoryId',
  brandId: 'brandId',
  title: 'title',
  description: 'description',
  sku: 'sku',
  barcode: 'barcode',
  unit: 'unit'
};

exports.Prisma.ProductBatchOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  itemId: 'itemId',
  batchNumber: 'batchNumber'
};

exports.Prisma.WarehouseOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  location: 'location'
};

exports.Prisma.InventoryOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  itemId: 'itemId',
  warehouseId: 'warehouseId',
  batchId: 'batchId'
};

exports.Prisma.StockMovementOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  inventoryId: 'inventoryId',
  itemId: 'itemId',
  reference: 'reference',
  reason: 'reason'
};

exports.Prisma.InventoryValuationOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  itemId: 'itemId',
  method: 'method',
  reference: 'reference'
};

exports.Prisma.WarehouseTransferOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  sourceId: 'sourceId',
  destinationId: 'destinationId',
  status: 'status'
};

exports.Prisma.WarehouseTransferItemOrderByRelevanceFieldEnum = {
  id: 'id',
  transferId: 'transferId',
  itemId: 'itemId',
  batchId: 'batchId'
};

exports.Prisma.StockReservationOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  inventoryId: 'inventoryId',
  orderId: 'orderId'
};

exports.Prisma.CustomerOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  email: 'email',
  phone: 'phone',
  address: 'address'
};

exports.Prisma.OrderOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  customerId: 'customerId',
  userId: 'userId',
  idempotencyKey: 'idempotencyKey'
};

exports.Prisma.OrderItemOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  orderId: 'orderId',
  itemId: 'itemId'
};

exports.Prisma.SupplierOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  contact: 'contact',
  email: 'email',
  phone: 'phone'
};

exports.Prisma.PurchaseOrderOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  supplierId: 'supplierId'
};

exports.Prisma.PurchaseItemOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  purchaseOrderId: 'purchaseOrderId',
  itemId: 'itemId'
};

exports.Prisma.AccountOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  code: 'code',
  systemType: 'systemType'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NotificationOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message'
};

exports.Prisma.InvoiceOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  customerId: 'customerId',
  orderId: 'orderId',
  invoiceNumber: 'invoiceNumber'
};

exports.Prisma.PaymentOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  orderId: 'orderId',
  method: 'method',
  transactionId: 'transactionId',
  idempotencyKey: 'idempotencyKey'
};

exports.Prisma.RefundOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  paymentId: 'paymentId',
  reason: 'reason',
  status: 'status'
};

exports.Prisma.AuditLogOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  userId: 'userId',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  requestId: 'requestId'
};

exports.Prisma.AiLogOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  userId: 'userId',
  type: 'type',
  prompt: 'prompt',
  response: 'response'
};

exports.Prisma.OutboxEventOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  aggregateType: 'aggregateType',
  aggregateId: 'aggregateId',
  eventType: 'eventType',
  lastError: 'lastError',
  lockId: 'lockId'
};

exports.Prisma.EmbeddingOrderByRelevanceFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  text: 'text',
  businessId: 'businessId'
};

exports.Prisma.ReviewOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  comment: 'comment',
  userId: 'userId',
  itemId: 'itemId'
};

exports.Prisma.PermissionOrderByRelevanceFieldEnum = {
  id: 'id',
  key: 'key',
  description: 'description'
};

exports.Prisma.RolePermissionOrderByRelevanceFieldEnum = {
  id: 'id',
  permissionId: 'permissionId'
};

exports.Prisma.UserBusinessRoleOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  businessId: 'businessId'
};

exports.Prisma.LoyaltyProgramOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId'
};

exports.Prisma.LoyaltyPointOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  customerId: 'customerId',
  reason: 'reason'
};

exports.Prisma.WebhookEventOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  provider: 'provider',
  externalId: 'externalId',
  lastError: 'lastError'
};

exports.Prisma.JournalEntryOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  description: 'description',
  reference: 'reference',
  source: 'source',
  postedById: 'postedById',
  eventId: 'eventId',
  idempotencyKey: 'idempotencyKey'
};

exports.Prisma.JournalLineOrderByRelevanceFieldEnum = {
  id: 'id',
  journalEntryId: 'journalEntryId',
  accountId: 'accountId',
  description: 'description'
};

exports.Prisma.ReconciliationLogOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  status: 'status',
  summary: 'summary'
};

exports.Prisma.ReportCacheOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  reportType: 'reportType'
};

exports.Prisma.SubscriptionPlanOrderByRelevanceFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name'
};

exports.Prisma.PlanFeatureOrderByRelevanceFieldEnum = {
  id: 'id',
  planId: 'planId',
  featureKey: 'featureKey',
  value: 'value'
};

exports.Prisma.SubscriptionOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  planId: 'planId'
};

exports.Prisma.UsageMetricOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  metricKey: 'metricKey'
};

exports.Prisma.SubscriptionEventOrderByRelevanceFieldEnum = {
  id: 'id',
  subscriptionId: 'subscriptionId',
  eventType: 'eventType'
};

exports.Prisma.CustomRoleOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  description: 'description',
  permissions: 'permissions'
};

exports.Prisma.UserCustomRoleOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  customRoleId: 'customRoleId'
};

exports.Prisma.SubscriptionInvoiceOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  subscriptionId: 'subscriptionId',
  invoiceNumber: 'invoiceNumber',
  currency: 'currency'
};

exports.Prisma.SubscriptionPaymentOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  invoiceId: 'invoiceId',
  method: 'method',
  transactionReference: 'transactionReference',
  gatewayPaymentId: 'gatewayPaymentId',
  gatewayTransactionId: 'gatewayTransactionId',
  idempotencyKey: 'idempotencyKey'
};

exports.Prisma.PaymentWebhookEventOrderByRelevanceFieldEnum = {
  id: 'id',
  externalEventId: 'externalEventId',
  status: 'status'
};

exports.Prisma.SubscriptionChangeRequestOrderByRelevanceFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  subscriptionId: 'subscriptionId',
  requestedPlanCode: 'requestedPlanCode'
};
exports.PlatformRole = exports.$Enums.PlatformRole = {
  USER: 'USER',
  SUPER_ADMIN: 'SUPER_ADMIN'
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
  PROCESSING: 'PROCESSING',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED'
};

exports.BusinessRole = exports.$Enums.BusinessRole = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF'
};

exports.JournalStatus = exports.$Enums.JournalStatus = {
  DRAFT: 'DRAFT',
  POSTED: 'POSTED'
};

exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  GRACE_PERIOD: 'GRACE_PERIOD',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED'
};

exports.SubscriptionInvoiceStatus = exports.$Enums.SubscriptionInvoiceStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  VOID: 'VOID'
};

exports.SubscriptionPaymentStatus = exports.$Enums.SubscriptionPaymentStatus = {
  PENDING: 'PENDING',
  WEBHOOK_RECEIVED: 'WEBHOOK_RECEIVED',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.PaymentGateway = exports.$Enums.PaymentGateway = {
  SSLCOMMERZ: 'SSLCOMMERZ',
  BKASH: 'BKASH',
  NAGAD: 'NAGAD'
};

exports.SubscriptionChangeRequestType = exports.$Enums.SubscriptionChangeRequestType = {
  UPGRADE: 'UPGRADE',
  RENEWAL: 'RENEWAL'
};

exports.SubscriptionChangeRequestStatus = exports.$Enums.SubscriptionChangeRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
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
  InventoryValuation: 'InventoryValuation',
  WarehouseTransfer: 'WarehouseTransfer',
  WarehouseTransferItem: 'WarehouseTransferItem',
  StockReservation: 'StockReservation',
  Customer: 'Customer',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Supplier: 'Supplier',
  PurchaseOrder: 'PurchaseOrder',
  PurchaseItem: 'PurchaseItem',
  Account: 'Account',
  Notification: 'Notification',
  Invoice: 'Invoice',
  Payment: 'Payment',
  Refund: 'Refund',
  AuditLog: 'AuditLog',
  AiLog: 'AiLog',
  OutboxEvent: 'OutboxEvent',
  Embedding: 'Embedding',
  Review: 'Review',
  Permission: 'Permission',
  RolePermission: 'RolePermission',
  UserBusinessRole: 'UserBusinessRole',
  LoyaltyProgram: 'LoyaltyProgram',
  LoyaltyPoint: 'LoyaltyPoint',
  WebhookEvent: 'WebhookEvent',
  JournalEntry: 'JournalEntry',
  JournalLine: 'JournalLine',
  ReconciliationLog: 'ReconciliationLog',
  ReportCache: 'ReportCache',
  SubscriptionPlan: 'SubscriptionPlan',
  PlanFeature: 'PlanFeature',
  Subscription: 'Subscription',
  UsageMetric: 'UsageMetric',
  SubscriptionEvent: 'SubscriptionEvent',
  CustomRole: 'CustomRole',
  UserCustomRole: 'UserCustomRole',
  SubscriptionInvoice: 'SubscriptionInvoice',
  SubscriptionPayment: 'SubscriptionPayment',
  PaymentWebhookEvent: 'PaymentWebhookEvent',
  SubscriptionChangeRequest: 'SubscriptionChangeRequest'
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
