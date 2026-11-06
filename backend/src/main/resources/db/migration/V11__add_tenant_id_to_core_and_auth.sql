-- Migration V11: Add tenant_id to core and auth tables (users, campus)

-- 1. users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE users SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users ADD CONSTRAINT uq_users_tenant_username UNIQUE (tenant_id, username);
ALTER TABLE users ADD CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- 2. campus table
ALTER TABLE campus ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE campus SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE campus ADD CONSTRAINT uq_campus_tenant_name UNIQUE (tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_campus_tenant_id ON campus(tenant_id);
