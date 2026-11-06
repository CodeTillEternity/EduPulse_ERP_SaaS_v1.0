-- Migration V15: Enable PostgreSQL Row-Level Security (RLS) on tenant-scoped tables
-- Maps row security directly to database session variable: current_setting('app.current_tenant', true)

-- academic_year
ALTER TABLE academic_year ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON academic_year;
CREATE POLICY tenant_isolation_policy ON academic_year
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- add_drop_request
ALTER TABLE add_drop_request ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON add_drop_request;
CREATE POLICY tenant_isolation_policy ON add_drop_request
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- admission_application
ALTER TABLE admission_application ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON admission_application;
CREATE POLICY tenant_isolation_policy ON admission_application
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- admission_inquiry
ALTER TABLE admission_inquiry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON admission_inquiry;
CREATE POLICY tenant_isolation_policy ON admission_inquiry
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- applicant
ALTER TABLE applicant ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON applicant;
CREATE POLICY tenant_isolation_policy ON applicant
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- applicant_document
ALTER TABLE applicant_document ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON applicant_document;
CREATE POLICY tenant_isolation_policy ON applicant_document
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- attendance_alert
ALTER TABLE attendance_alert ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON attendance_alert;
CREATE POLICY tenant_isolation_policy ON attendance_alert
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- attendance_correction
ALTER TABLE attendance_correction ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON attendance_correction;
CREATE POLICY tenant_isolation_policy ON attendance_correction
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- batch
ALTER TABLE batch ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON batch;
CREATE POLICY tenant_isolation_policy ON batch
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- campus
ALTER TABLE campus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON campus;
CREATE POLICY tenant_isolation_policy ON campus
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- class_schedule
ALTER TABLE class_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON class_schedule;
CREATE POLICY tenant_isolation_policy ON class_schedule
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- course
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON course;
CREATE POLICY tenant_isolation_policy ON course
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- course_offering
ALTER TABLE course_offering ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON course_offering;
CREATE POLICY tenant_isolation_policy ON course_offering
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- course_prerequisite
ALTER TABLE course_prerequisite ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON course_prerequisite;
CREATE POLICY tenant_isolation_policy ON course_prerequisite
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- course_registration
ALTER TABLE course_registration ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON course_registration;
CREATE POLICY tenant_isolation_policy ON course_registration
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- credit_rule
ALTER TABLE credit_rule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON credit_rule;
CREATE POLICY tenant_isolation_policy ON credit_rule
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- curriculum
ALTER TABLE curriculum ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON curriculum;
CREATE POLICY tenant_isolation_policy ON curriculum
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- curriculum_course
ALTER TABLE curriculum_course ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON curriculum_course;
CREATE POLICY tenant_isolation_policy ON curriculum_course
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- department
ALTER TABLE department ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON department;
CREATE POLICY tenant_isolation_policy ON department
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- faculty
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON faculty;
CREATE POLICY tenant_isolation_policy ON faculty
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- fee_head
ALTER TABLE fee_head ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON fee_head;
CREATE POLICY tenant_isolation_policy ON fee_head
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- fee_structure
ALTER TABLE fee_structure ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON fee_structure;
CREATE POLICY tenant_isolation_policy ON fee_structure
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- fee_structure_component
ALTER TABLE fee_structure_component ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON fee_structure_component;
CREATE POLICY tenant_isolation_policy ON fee_structure_component
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- finance_concession
ALTER TABLE finance_concession ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON finance_concession;
CREATE POLICY tenant_isolation_policy ON finance_concession
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- finance_payment
ALTER TABLE finance_payment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON finance_payment;
CREATE POLICY tenant_isolation_policy ON finance_payment
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- finance_payment_allocation
ALTER TABLE finance_payment_allocation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON finance_payment_allocation;
CREATE POLICY tenant_isolation_policy ON finance_payment_allocation
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- finance_receipt
ALTER TABLE finance_receipt ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON finance_receipt;
CREATE POLICY tenant_isolation_policy ON finance_receipt
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- finance_scholarship
ALTER TABLE finance_scholarship ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON finance_scholarship;
CREATE POLICY tenant_isolation_policy ON finance_scholarship
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- finance_student_scholarship
ALTER TABLE finance_student_scholarship ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON finance_student_scholarship;
CREATE POLICY tenant_isolation_policy ON finance_student_scholarship
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- guardians
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON guardians;
CREATE POLICY tenant_isolation_policy ON guardians
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- leave_request
ALTER TABLE leave_request ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON leave_request;
CREATE POLICY tenant_isolation_policy ON leave_request
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON notifications;
CREATE POLICY tenant_isolation_policy ON notifications
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- program
ALTER TABLE program ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON program;
CREATE POLICY tenant_isolation_policy ON program
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- room
ALTER TABLE room ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON room;
CREATE POLICY tenant_isolation_policy ON room
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- section
ALTER TABLE section ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON section;
CREATE POLICY tenant_isolation_policy ON section
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- section_faculty
ALTER TABLE section_faculty ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON section_faculty;
CREATE POLICY tenant_isolation_policy ON section_faculty
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- section_student
ALTER TABLE section_student ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON section_student;
CREATE POLICY tenant_isolation_policy ON section_student
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- semester
ALTER TABLE semester ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON semester;
CREATE POLICY tenant_isolation_policy ON semester
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- student_academic_records
ALTER TABLE student_academic_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON student_academic_records;
CREATE POLICY tenant_isolation_policy ON student_academic_records
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- student_attendance_record
ALTER TABLE student_attendance_record ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON student_attendance_record;
CREATE POLICY tenant_isolation_policy ON student_attendance_record
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- student_categories
ALTER TABLE student_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON student_categories;
CREATE POLICY tenant_isolation_policy ON student_categories
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- student_documents
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON student_documents;
CREATE POLICY tenant_isolation_policy ON student_documents
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- student_enrollments
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON student_enrollments;
CREATE POLICY tenant_isolation_policy ON student_enrollments
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- student_fee
ALTER TABLE student_fee ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON student_fee;
CREATE POLICY tenant_isolation_policy ON student_fee
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- student_fee_component
ALTER TABLE student_fee_component ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON student_fee_component;
CREATE POLICY tenant_isolation_policy ON student_fee_component
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- student_history
ALTER TABLE student_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON student_history;
CREATE POLICY tenant_isolation_policy ON student_history
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- student_photos
ALTER TABLE student_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON student_photos;
CREATE POLICY tenant_isolation_policy ON student_photos
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- student_status_history
ALTER TABLE student_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON student_status_history;
CREATE POLICY tenant_isolation_policy ON student_status_history
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON students;
CREATE POLICY tenant_isolation_policy ON students
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- subject
ALTER TABLE subject ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON subject;
CREATE POLICY tenant_isolation_policy ON subject
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- time_slot
ALTER TABLE time_slot ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON time_slot;
CREATE POLICY tenant_isolation_policy ON time_slot
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- timetable_slot
ALTER TABLE timetable_slot ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON timetable_slot;
CREATE POLICY tenant_isolation_policy ON timetable_slot
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON users;
CREATE POLICY tenant_isolation_policy ON users
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));
