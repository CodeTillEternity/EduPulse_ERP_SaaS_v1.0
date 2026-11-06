-- Migration V14: Add tenant_id to finance and attendance tables

-- 1. attendance_alert
ALTER TABLE attendance_alert ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE attendance_alert SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_alert_tenant_id ON attendance_alert(tenant_id);

-- 2. attendance_correction
ALTER TABLE attendance_correction ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE attendance_correction SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_correction_tenant_id ON attendance_correction(tenant_id);

-- 3. student_attendance_record
ALTER TABLE student_attendance_record ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE student_attendance_record SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_student_attendance_record_tenant_id ON student_attendance_record(tenant_id);

-- 4. leave_request
ALTER TABLE leave_request ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE leave_request SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_leave_request_tenant_id ON leave_request(tenant_id);

-- 5. fee_head
ALTER TABLE fee_head ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE fee_head SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE fee_head DROP CONSTRAINT IF EXISTS fee_head_code_key;
ALTER TABLE fee_head ADD CONSTRAINT uq_fee_head_tenant_code UNIQUE (tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_fee_head_tenant_id ON fee_head(tenant_id);

-- 6. fee_structure
ALTER TABLE fee_structure ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE fee_structure SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE fee_structure DROP CONSTRAINT IF EXISTS fee_structure_code_key;
ALTER TABLE fee_structure ADD CONSTRAINT uq_fee_structure_tenant_code UNIQUE (tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_fee_structure_tenant_id ON fee_structure(tenant_id);

-- 7. fee_structure_component
ALTER TABLE fee_structure_component ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE fee_structure_component SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_fee_structure_component_tenant_id ON fee_structure_component(tenant_id);

-- 8. finance_concession
ALTER TABLE finance_concession ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE finance_concession SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_finance_concession_tenant_id ON finance_concession(tenant_id);

-- 9. finance_payment
ALTER TABLE finance_payment ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE finance_payment SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE finance_payment DROP CONSTRAINT IF EXISTS finance_payment_reference_number_key;
ALTER TABLE finance_payment ADD CONSTRAINT uq_finance_payment_tenant_ref UNIQUE (tenant_id, reference_number);
CREATE INDEX IF NOT EXISTS idx_finance_payment_tenant_id ON finance_payment(tenant_id);

-- 10. finance_payment_allocation
ALTER TABLE finance_payment_allocation ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE finance_payment_allocation SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_finance_payment_allocation_tenant_id ON finance_payment_allocation(tenant_id);

-- 11. finance_receipt
ALTER TABLE finance_receipt ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE finance_receipt SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE finance_receipt DROP CONSTRAINT IF EXISTS finance_receipt_receipt_number_key;
ALTER TABLE finance_receipt ADD CONSTRAINT uq_finance_receipt_tenant_number UNIQUE (tenant_id, receipt_number);
CREATE INDEX IF NOT EXISTS idx_finance_receipt_tenant_id ON finance_receipt(tenant_id);

-- 12. finance_scholarship
ALTER TABLE finance_scholarship ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE finance_scholarship SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_finance_scholarship_tenant_id ON finance_scholarship(tenant_id);

-- 13. finance_student_scholarship
ALTER TABLE finance_student_scholarship ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE finance_student_scholarship SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_finance_student_scholarship_tenant_id ON finance_student_scholarship(tenant_id);

-- 14. student_fee
ALTER TABLE student_fee ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE student_fee SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_student_fee_tenant_id ON student_fee(tenant_id);

-- 15. student_fee_component
ALTER TABLE student_fee_component ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE student_fee_component SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_student_fee_component_tenant_id ON student_fee_component(tenant_id);

-- 16. notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE notifications SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
