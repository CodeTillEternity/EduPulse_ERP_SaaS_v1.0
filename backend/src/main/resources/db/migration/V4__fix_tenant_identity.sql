-- ============================================================================
-- Migration V4 (Commercial SaaS Control Plane): Fix Tenant Identity Constraint
-- Bifurcates multi-tenant identity so emails are unique per tenant (tenant_id, email)
-- ============================================================================

-- Drop global unique constraint on users(email) if present
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS uk_users_email;
ALTER TABLE users DROP CONSTRAINT IF EXISTS uq_users_email;

-- Ensure composite unique constraint on (tenant_id, email)
ALTER TABLE users DROP CONSTRAINT IF EXISTS uk_users_tenant_email;
ALTER TABLE users DROP CONSTRAINT IF EXISTS uq_users_tenant_email;
ALTER TABLE users ADD CONSTRAINT uk_users_tenant_email UNIQUE (tenant_id, email);

-- Create supporting composite index for rapid tenant-scoped lookups
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users (tenant_id, email);

