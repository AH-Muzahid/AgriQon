-- =========================================================
-- AGRIQON ENTERPRISE ERP/POS - MASTER DATABASE SCHEMA
-- VERSION: 2.2 (ENTERPRISE HARDENED ARCHITECTURE)
-- =========================================================

-- 0. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. ENUMS (Safe Creation)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('USER', 'SELLER', 'ADMIN', 'MANAGER', 'CASHIER', 'ACCOUNTANT', 'WAREHOUSE_KEEPER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus') THEN
        CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
        CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REFUNDED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProcessingStatus') THEN
        CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MovementType') THEN
        CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RETURN');
    END IF;
END $$;

-- 2. CORE IDENTITY TABLES
CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Business" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "taxNumber" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "businessId" TEXT REFERENCES "Business"("id") ON DELETE SET NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCT CATALOG
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "parentId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Brand" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Item" (
    "id" TEXT PRIMARY KEY,
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "categoryId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL,
    "brandId" TEXT REFERENCES "Brand"("id") ON DELETE SET NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "barcode" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "costPrice" DECIMAL(15,2),
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "hasBatches" BOOLEAN NOT NULL DEFAULT false,
    "isService" BOOLEAN NOT NULL DEFAULT false,
    "searchVector" tsvector,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("businessId", "sku")
);

CREATE TABLE IF NOT EXISTS "ProductBatch" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "itemId" TEXT NOT NULL REFERENCES "Item"("id") ON DELETE CASCADE,
    "batchNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("itemId", "batchNumber")
);

-- 4. INVENTORY & WAREHOUSING
CREATE TABLE IF NOT EXISTS "Warehouse" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Inventory" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "itemId" TEXT NOT NULL REFERENCES "Item"("id") ON DELETE CASCADE,
    "warehouseId" TEXT NOT NULL REFERENCES "Warehouse"("id") ON DELETE CASCADE,
    "batchId" TEXT REFERENCES "ProductBatch"("id") ON DELETE SET NULL,
    "availableStock" INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "totalStock" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("warehouseId", "itemId", "batchId")
);

CREATE TABLE IF NOT EXISTS "StockMovement" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "inventoryId" TEXT NOT NULL REFERENCES "Inventory"("id") ON DELETE CASCADE,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reference" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "WarehouseTransfer" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sourceId" TEXT NOT NULL REFERENCES "Warehouse"("id") ON DELETE CASCADE,
    "destinationId" TEXT NOT NULL REFERENCES "Warehouse"("id") ON DELETE CASCADE,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "StockReservation" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "inventoryId" TEXT NOT NULL REFERENCES "Inventory"("id") ON DELETE CASCADE,
    "orderId" TEXT NOT NULL, -- Order ID from Order table
    "quantity" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. CRM & SALES
CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "searchVector" tsvector,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT PRIMARY KEY,
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "customerId" TEXT REFERENCES "Customer"("id") ON DELETE SET NULL,
    "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL(15,2) NOT NULL,
    "taxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "itemId" TEXT NOT NULL REFERENCES "Item"("id") ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(15,2) NOT NULL DEFAULT 0
);

-- 6. PROCUREMENT
CREATE TABLE IF NOT EXISTS "Supplier" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PurchaseOrder" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "supplierId" TEXT NOT NULL REFERENCES "Supplier"("id") ON DELETE CASCADE,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PurchaseItem" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "purchaseOrderId" TEXT NOT NULL REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE,
    "itemId" TEXT NOT NULL REFERENCES "Item"("id") ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(15,2) NOT NULL
);

-- 7. FINANCE & ACCOUNTING
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    UNIQUE("businessId", "code")
);

CREATE TABLE IF NOT EXISTS "LedgerEntry" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "accountId" TEXT NOT NULL REFERENCES "Account"("id") ON DELETE CASCADE,
    "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "customerId" TEXT REFERENCES "Customer"("id") ON DELETE SET NULL,
    "orderId" TEXT UNIQUE NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "invoiceNumber" TEXT UNIQUE NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "dueAmount" DECIMAL(15,2) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "searchVector" tsvector,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "amount" DECIMAL(15,2) NOT NULL,
    "method" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "idempotencyKey" TEXT UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. SYSTEM & AUDIT
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousData" JSONB,
    "newData" JSONB,
    "changedFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AiLog" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "contextData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "WebhookEvent" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "gateway" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "OutboxEvent" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "businessId" TEXT NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Embedding" (
    "id" TEXT PRIMARY KEY,
    "itemId" TEXT UNIQUE NOT NULL REFERENCES "Item"("id") ON DELETE CASCADE,
    "vector" JSONB NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "itemId" TEXT NOT NULL REFERENCES "Item"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "itemId")
);

-- ==========================================
-- PRODUCTION HARDENING (IDEMPOTENT)
-- ==========================================

-- 1. INDEXES
CREATE INDEX IF NOT EXISTS "idx_orders_active" ON "Order"("businessId", "status") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_invoices_active" ON "Invoice"("businessId", "dueAmount") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_audit_payload" ON "AuditLog" USING GIN ("newData");
CREATE INDEX IF NOT EXISTS "idx_webhook_payload" ON "WebhookEvent" USING GIN ("payload");

-- 2. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'Item' THEN
        NEW."searchVector" := to_tsvector('simple', COALESCE(NEW."title", '') || ' ' || COALESCE(NEW."description", '') || ' ' || COALESCE(NEW."sku", ''));
    ELSIF TG_TABLE_NAME = 'Customer' THEN
        NEW."searchVector" := to_tsvector('simple', COALESCE(NEW."name", '') || ' ' || COALESCE(NEW."email", '') || ' ' || COALESCE(NEW."phone", ''));
    ELSIF TG_TABLE_NAME = 'Invoice' THEN
        NEW."searchVector" := to_tsvector('simple', COALESCE(NEW."invoiceNumber", ''));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger applications
DO $$ 
DECLARE
    t text;
BEGIN
    -- updatedAt triggers
    FOR t IN SELECT table_name FROM information_schema.columns WHERE column_name = 'updatedAt' AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_update_updated_at ON %I', t);
        EXECUTE format('CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
    END LOOP;

    -- searchVector triggers
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_item_search_vector') THEN
        CREATE TRIGGER trg_item_search_vector BEFORE INSERT OR UPDATE ON "Item" FOR EACH ROW EXECUTE FUNCTION update_search_vector();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_customer_search_vector') THEN
        CREATE TRIGGER trg_customer_search_vector BEFORE INSERT OR UPDATE ON "Customer" FOR EACH ROW EXECUTE FUNCTION update_search_vector();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_invoice_search_vector') THEN
        CREATE TRIGGER trg_invoice_search_vector BEFORE INSERT OR UPDATE ON "Invoice" FOR EACH ROW EXECUTE FUNCTION update_search_vector();
    END IF;
END $$;

-- 3. CONSTRAINTS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'chk_stock_positive') THEN
        ALTER TABLE "Inventory" ADD CONSTRAINT chk_stock_positive CHECK ("availableStock" >= 0 AND "totalStock" >= 0);
    END IF;
END $$;

-- 4. MATERIALIZED VIEW
DROP MATERIALIZED VIEW IF EXISTS mv_business_sales_summary;
CREATE MATERIALIZED VIEW mv_business_sales_summary AS
SELECT 
    "businessId",
    DATE_TRUNC('day', "createdAt") as day,
    COUNT(id) as order_count,
    SUM(total) as daily_revenue
FROM "Order"
WHERE "deletedAt" IS NULL
GROUP BY 1, 2;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_sales_summary_unique ON mv_business_sales_summary("businessId", day);

-- 5. ROW LEVEL SECURITY (RLS)
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.columns WHERE column_name = 'businessId' AND table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS business_isolation_policy ON %I', t);
        EXECUTE format('CREATE POLICY business_isolation_policy ON %I FOR ALL USING ("businessId" = current_setting(''app.current_business_id'', true))', t);
    END LOOP;
END $$;

-- 6. ARCHIVE TABLES
CREATE TABLE IF NOT EXISTS "AuditLogArchive" (LIKE "AuditLog" INCLUDING ALL);
CREATE TABLE IF NOT EXISTS "StockMovementArchive" (LIKE "StockMovement" INCLUDING ALL);