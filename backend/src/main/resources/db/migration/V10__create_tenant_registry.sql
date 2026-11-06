-- Migration V10: Create tenant_registry table for multi-tenant SaaS architecture

CREATE TABLE IF NOT EXISTS tenant_registry (
    tenant_id VARCHAR(64) PRIMARY KEY,
    institution_name VARCHAR(255) NOT NULL,
    tenant_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    database_mode VARCHAR(50) NOT NULL DEFAULT 'SHARED_DATABASE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenant_registry_status ON tenant_registry(tenant_status);
CREATE INDEX IF NOT EXISTS idx_tenant_registry_institution ON tenant_registry(institution_name);
