-- Migration V13: Add tenant_id to student, applicant, and admission tables

-- 1. admission_application
ALTER TABLE admission_application ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE admission_application SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE admission_application DROP CONSTRAINT IF EXISTS admission_application_application_number_key;
ALTER TABLE admission_application ADD CONSTRAINT uq_admission_app_tenant_num UNIQUE (tenant_id, application_number);
CREATE INDEX IF NOT EXISTS idx_admission_application_tenant_id ON admission_application(tenant_id);

-- 2. admission_inquiry
ALTER TABLE admission_inquiry ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE admission_inquiry SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_admission_inquiry_tenant_id ON admission_inquiry(tenant_id);

-- 3. applicant
ALTER TABLE applicant ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE applicant SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE applicant DROP CONSTRAINT IF EXISTS applicant_email_key;
ALTER TABLE applicant DROP CONSTRAINT IF EXISTS applicant_phone_key;
ALTER TABLE applicant ADD CONSTRAINT uq_applicant_tenant_email UNIQUE (tenant_id, email);
ALTER TABLE applicant ADD CONSTRAINT uq_applicant_tenant_phone UNIQUE (tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_applicant_tenant_id ON applicant(tenant_id);

-- 4. applicant_document
ALTER TABLE applicant_document ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE applicant_document SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_applicant_document_tenant_id ON applicant_document(tenant_id);

-- 5. guardians
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE guardians SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_guardians_tenant_id ON guardians(tenant_id);

-- 6. student_academic_records
ALTER TABLE student_academic_records ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE student_academic_records SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_student_academic_records_tenant_id ON student_academic_records(tenant_id);

-- 7. student_categories
ALTER TABLE student_categories ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE student_categories SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_student_categories_tenant_id ON student_categories(tenant_id);

-- 8. student_documents
ALTER TABLE student_documents ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE student_documents SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_student_documents_tenant_id ON student_documents(tenant_id);

-- 9. student_enrollments
ALTER TABLE student_enrollments ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE student_enrollments SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_student_enrollments_tenant_id ON student_enrollments(tenant_id);

-- 10. student_history
ALTER TABLE student_history ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE student_history SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_student_history_tenant_id ON student_history(tenant_id);

-- 11. student_photos
ALTER TABLE student_photos ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE student_photos SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_student_photos_tenant_id ON student_photos(tenant_id);

-- 12. student_status_history
ALTER TABLE student_status_history ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE student_status_history SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_student_status_history_tenant_id ON student_status_history(tenant_id);

-- 13. students
ALTER TABLE students ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_number VARCHAR(50);
UPDATE students SET tenant_id = 'default' WHERE tenant_id IS NULL;
UPDATE students SET admission_number = roll_number WHERE admission_number IS NULL;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_roll_number_key;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_email_key;
ALTER TABLE students ADD CONSTRAINT uq_students_tenant_roll_number UNIQUE (tenant_id, roll_number);
ALTER TABLE students ADD CONSTRAINT uq_students_tenant_admission_number UNIQUE (tenant_id, admission_number);
ALTER TABLE students ADD CONSTRAINT uq_students_tenant_email UNIQUE (tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_students_tenant_id ON students(tenant_id);
