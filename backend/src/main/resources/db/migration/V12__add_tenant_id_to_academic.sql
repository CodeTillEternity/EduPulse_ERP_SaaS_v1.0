-- Migration V12: Add tenant_id to academic tables and update unique constraints

-- 1. academic_year
ALTER TABLE academic_year ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE academic_year SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE academic_year ADD CONSTRAINT uq_academic_year_tenant_name UNIQUE (tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_academic_year_tenant_id ON academic_year(tenant_id);

-- 2. batch
ALTER TABLE batch ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE batch SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE batch ADD CONSTRAINT uq_batch_tenant_code UNIQUE (tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_batch_tenant_id ON batch(tenant_id);

-- 3. department
ALTER TABLE department ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE department SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE department ADD CONSTRAINT uq_department_tenant_code UNIQUE (tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_department_tenant_id ON department(tenant_id);

-- 4. program
ALTER TABLE program ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE program SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE program ADD CONSTRAINT uq_program_tenant_code UNIQUE (tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_program_tenant_id ON program(tenant_id);

-- 5. course
ALTER TABLE course ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE course SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE course ADD CONSTRAINT uq_course_tenant_code UNIQUE (tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_course_tenant_id ON course(tenant_id);

-- 6. subject
ALTER TABLE subject ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE subject SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE subject DROP CONSTRAINT IF EXISTS subject_code_key;
ALTER TABLE subject ADD CONSTRAINT uq_subject_tenant_code UNIQUE (tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_subject_tenant_id ON subject(tenant_id);

-- 7. room
ALTER TABLE room ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE room SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE room DROP CONSTRAINT IF EXISTS room_name_key;
ALTER TABLE room ADD CONSTRAINT uq_room_tenant_name UNIQUE (tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_room_tenant_id ON room(tenant_id);

-- 8. semester
ALTER TABLE semester ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE semester SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_semester_tenant_id ON semester(tenant_id);

-- 9. curriculum
ALTER TABLE curriculum ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE curriculum SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_curriculum_tenant_id ON curriculum(tenant_id);

-- 10. curriculum_course
ALTER TABLE curriculum_course ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE curriculum_course SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_curriculum_course_tenant_id ON curriculum_course(tenant_id);

-- 11. course_offering
ALTER TABLE course_offering ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE course_offering SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_course_offering_tenant_id ON course_offering(tenant_id);

-- 12. course_prerequisite
ALTER TABLE course_prerequisite ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE course_prerequisite SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_course_prerequisite_tenant_id ON course_prerequisite(tenant_id);

-- 13. course_registration
ALTER TABLE course_registration ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE course_registration SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_course_registration_tenant_id ON course_registration(tenant_id);

-- 14. credit_rule
ALTER TABLE credit_rule ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE credit_rule SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_credit_rule_tenant_id ON credit_rule(tenant_id);

-- 15. section
ALTER TABLE section ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE section SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_section_tenant_id ON section(tenant_id);

-- 16. section_faculty
ALTER TABLE section_faculty ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE section_faculty SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_section_faculty_tenant_id ON section_faculty(tenant_id);

-- 17. section_student
ALTER TABLE section_student ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE section_student SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_section_student_tenant_id ON section_student(tenant_id);

-- 18. class_schedule
ALTER TABLE class_schedule ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE class_schedule SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_class_schedule_tenant_id ON class_schedule(tenant_id);

-- 19. time_slot
ALTER TABLE time_slot ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE time_slot SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_time_slot_tenant_id ON time_slot(tenant_id);

-- 20. timetable_slot
ALTER TABLE timetable_slot ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE timetable_slot SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_timetable_slot_tenant_id ON timetable_slot(tenant_id);

-- 21. add_drop_request
ALTER TABLE add_drop_request ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE add_drop_request SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_add_drop_request_tenant_id ON add_drop_request(tenant_id);

-- 22. faculty
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
UPDATE faculty SET tenant_id = 'default' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_faculty_tenant_id ON faculty(tenant_id);
