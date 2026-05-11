CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,

    gateway VARCHAR(100) NOT NULL,

    event_type VARCHAR(255) NOT NULL,

    event_id VARCHAR(255),

    idempotency_key VARCHAR(255),

    signature TEXT,

    payload JSONB NOT NULL,

    headers JSONB,

    processing_status VARCHAR(50) DEFAULT 'PENDING',

    retry_count INTEGER DEFAULT 0,

    processed_at TIMESTAMP NULL,

    failed_reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,

    aggregate_type VARCHAR(100) NOT NULL,

    aggregate_id UUID NOT NULL,

    event_type VARCHAR(255) NOT NULL,

    payload JSONB NOT NULL,

    is_processed BOOLEAN DEFAULT FALSE,

    processed_at TIMESTAMP NULL,

    retry_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs_archive
(LIKE audit_logs INCLUDING ALL);

CREATE TABLE IF NOT EXISTS stock_movements_archive
(LIKE stock_movements INCLUDING ALL);

CREATE TABLE IF NOT EXISTS failed_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    queue_name VARCHAR(255) NOT NULL,

    job_name VARCHAR(255),

    payload JSONB,

    error_message TEXT,

    stack_trace TEXT,

    retry_count INTEGER DEFAULT 0,

    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    identifier VARCHAR(255) NOT NULL,

    endpoint VARCHAR(255),

    request_count INTEGER DEFAULT 0,

    window_start TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);