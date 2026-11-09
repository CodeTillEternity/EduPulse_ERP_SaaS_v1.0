-- flyway:non-transactional
-- Migration: Add PostgreSQL B-Tree performance indices for high-concurrency multi-tenant scalability
-- Optimization for tenant-scoped partitioning, white-label branding resolution, and student dashboard queries

-- ============================================================================
-- 1. Subdomain Index on Tenant Branding Table (Rapid Branding & White-Label Lookup)
-- ============================================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_branding_custom_subdomain 
    ON tenant_branding (custom_subdomain);

-- ============================================================================
-- 2. Tenant ID Indices across Major Domain & Operational Tables
-- ============================================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_branding_tenant_id 
    ON tenant_branding (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_tenant_id 
    ON students (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_tenant_id 
    ON users (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_faculty_tenant_id 
    ON faculty (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_batch_tenant_id 
    ON batch (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_course_tenant_id 
    ON course (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_documents_tenant_id 
    ON student_documents (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_photos_tenant_id 
    ON student_photos (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finance_student_invoices_tenant_id 
    ON finance_student_invoices (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finance_fee_payments_tenant_id 
    ON finance_fee_payments (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finance_fee_structures_tenant_id 
    ON finance_fee_structures (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_attendance_record_tenant_id 
    ON student_attendance_record (tenant_id);

-- ============================================================================
-- 3. Composite Indices on (student_id, status) for Student Portal & Dashboard
-- ============================================================================
-- Drastically accelerates student portal financial ledger & unpaid invoice queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finance_invoices_student_status 
    ON finance_student_invoices (student_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_fee_student_status 
    ON student_fee (student_id, status);

-- Drastically accelerates student portal attendance summary and aggregation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_attendance_student_status 
    ON student_attendance_record (student_id, status);
