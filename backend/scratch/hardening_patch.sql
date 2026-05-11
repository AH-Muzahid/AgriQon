-- =========================================================
-- ENTERPRISE ERP/POS SAAS
-- PRODUCTION HARDENING PATCH (REFACTORED FOR PRISMA)
-- =========================================================

-- 1. SOFT DELETE SUPPORT (Prisma handled columns, adding indexes)
-- Already handled by Prisma: deletedAt column in Order, Invoice, Customer, Item, User

-- 2. PARTIAL INDEX OPTIMIZATION
CREATE INDEX IF NOT EXISTS "idx_orders_active_status"
ON "Order"("businessId", "status", "createdAt" DESC)
WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_orders_active_payment"
ON "Order"("businessId", "paymentStatus", "createdAt" DESC)
WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_invoices_active_status"
ON "Invoice"("businessId", "createdAt" DESC)
WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_customers_active_phone"
ON "Customer"("businessId", "phone")
WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_products_active_title"
ON "Item"("businessId", "title")
WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_products_active_brand"
ON "Item"("businessId", "brand")
WHERE "deletedAt" IS NULL;

-- 3. JSONB GIN INDEX OPTIMIZATION
CREATE INDEX IF NOT EXISTS "idx_subscription_features_gin"
ON "SubscriptionPlan"
USING GIN("features");

CREATE INDEX IF NOT EXISTS "idx_audit_previous_data_gin"
ON "AuditLog"
USING GIN("previousData");

CREATE INDEX IF NOT EXISTS "idx_audit_new_data_gin"
ON "AuditLog"
USING GIN("newData");

CREATE INDEX IF NOT EXISTS "idx_audit_changed_fields_gin"
ON "AuditLog"
USING GIN("changedFields");

CREATE INDEX IF NOT EXISTS "idx_ai_context_data_gin"
ON "AiLog"
USING GIN("contextData");

-- 4. FULL TEXT SEARCH SUPPORT
-- searchVector columns added by Prisma as Unsupported("tsvector")

-- PRODUCT SEARCH VECTOR (Item)
UPDATE "Item"
SET "searchVector" =
    to_tsvector(
        'simple',
        COALESCE("title", '') || ' ' ||
        COALESCE("description", '') || ' ' ||
        COALESCE("brand", '') || ' ' ||
        COALESCE("sku", '') || ' ' ||
        COALESCE("barcode", '')
    );

CREATE INDEX IF NOT EXISTS "idx_products_search_vector"
ON "Item"
USING GIN("searchVector");

-- CUSTOMER SEARCH VECTOR
UPDATE "Customer"
SET "searchVector" =
    to_tsvector(
        'simple',
        COALESCE("name", '') || ' ' ||
        COALESCE("email", '') || ' ' ||
        COALESCE("phone", '')
    );

CREATE INDEX IF NOT EXISTS "idx_customers_search_vector"
ON "Customer"
USING GIN("searchVector");

-- INVOICE SEARCH VECTOR
UPDATE "Invoice"
SET "searchVector" =
    to_tsvector(
        'simple',
        COALESCE("invoiceNumber", '')
    );

CREATE INDEX IF NOT EXISTS "idx_invoices_search_vector"
ON "Invoice"
USING GIN("searchVector");

-- SEARCH VECTOR TRIGGER FUNCTIONS
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW."searchVector" :=
        to_tsvector(
            'simple',
            COALESCE(NEW."title", '') || ' ' ||
            COALESCE(NEW."description", '') || ' ' ||
            COALESCE(NEW."brand", '') || ' ' ||
            COALESCE(NEW."sku", '') || ' ' ||
            COALESCE(NEW."barcode", '')
        );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_customer_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW."searchVector" :=
        to_tsvector(
            'simple',
            COALESCE(NEW."name", '') || ' ' ||
            COALESCE(NEW."email", '') || ' ' ||
            COALESCE(NEW."phone", '')
        );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_invoice_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW."searchVector" :=
        to_tsvector(
            'simple',
            COALESCE(NEW."invoiceNumber", '')
        );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- SEARCH VECTOR TRIGGERS
DROP TRIGGER IF EXISTS trg_product_search_vector ON "Item";
CREATE TRIGGER trg_product_search_vector
BEFORE INSERT OR UPDATE
ON "Item"
FOR EACH ROW
EXECUTE FUNCTION update_product_search_vector();

DROP TRIGGER IF EXISTS trg_customer_search_vector ON "Customer";
CREATE TRIGGER trg_customer_search_vector
BEFORE INSERT OR UPDATE
ON "Customer"
FOR EACH ROW
EXECUTE FUNCTION update_customer_search_vector();

DROP TRIGGER IF EXISTS trg_invoice_search_vector ON "Invoice";
CREATE TRIGGER trg_invoice_search_vector
BEFORE INSERT OR UPDATE
ON "Invoice"
FOR EACH ROW
EXECUTE FUNCTION update_invoice_search_vector();

-- 5. STOCK SAFETY HARDENING
ALTER TABLE "Inventory"
ADD CONSTRAINT chk_available_stock_non_negative
CHECK ("availableStock" >= 0);

ALTER TABLE "Inventory"
ADD CONSTRAINT chk_total_stock_non_negative
CHECK ("totalStock" >= 0);

ALTER TABLE "Inventory"
ADD CONSTRAINT chk_reserved_stock_non_negative
CHECK ("reservedStock" >= 0);

-- 6. PAYMENT CONSISTENCY RULES
ALTER TABLE "Invoice"
ADD CONSTRAINT chk_invoice_amount_consistency
CHECK (
    "totalAmount" >= "paidAmount"
);

ALTER TABLE "Invoice"
ADD CONSTRAINT chk_due_amount_consistency
CHECK (
    "dueAmount" = "totalAmount" - "paidAmount"
);

-- 7. BUSINESS SCOPED INDEXES
CREATE INDEX IF NOT EXISTS "idx_products_business_created"
ON "Item"("businessId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_customers_business_created"
ON "Customer"("businessId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_payments_business_created"
ON "Payment"("businessId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_inventory_business_product"
ON "Inventory"("businessId", "productId");

CREATE INDEX IF NOT EXISTS "idx_stock_movements_business_type"
ON "StockMovement"("businessId", "type");

-- 8. ARCHIVAL TABLES
CREATE TABLE IF NOT EXISTS "AuditLogArchive"
(LIKE "AuditLog" INCLUDING ALL);

CREATE TABLE IF NOT EXISTS "StockMovementArchive"
(LIKE "StockMovement" INCLUDING ALL);

-- 9. MATERIALIZED VIEW
DROP MATERIALIZED VIEW IF EXISTS mv_sales_summary;
CREATE MATERIALIZED VIEW mv_sales_summary AS
SELECT
    "businessId",
    DATE("createdAt") AS sales_date,
    COUNT(*) AS total_orders,
    SUM("total") AS gross_sales,
    AVG("total") AS average_order_value
FROM "Order"
WHERE "deletedAt" IS NULL
GROUP BY "businessId", DATE("createdAt");

CREATE INDEX IF NOT EXISTS idx_mv_sales_summary
ON mv_sales_summary("businessId", sales_date);

-- 10. REFRESH FUNCTION
CREATE OR REPLACE FUNCTION refresh_sales_summary()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_summary;
END;
$$ LANGUAGE plpgsql;

-- 11. ROW LEVEL SECURITY (Optional for now, but enabling as requested)
ALTER TABLE "Item" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Inventory" ENABLE ROW LEVEL SECURITY;

-- 12. DEADLOCK REDUCTION INDEX
CREATE INDEX IF NOT EXISTS idx_inventory_locking
ON "Inventory"(
    "businessId",
    "warehouseId",
    "productId",
    "version"
);

-- 13. PERFORMANCE ANALYSIS INDEXES
CREATE INDEX IF NOT EXISTS "idx_orders_created_desc"
ON "Order"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_payments_created_desc"
ON "Payment"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_stock_movements_created_desc"
ON "StockMovement"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_desc"
ON "AuditLog"("createdAt" DESC);
