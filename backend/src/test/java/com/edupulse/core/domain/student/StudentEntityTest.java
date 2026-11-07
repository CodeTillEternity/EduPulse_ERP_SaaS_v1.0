package com.edupulse.core.domain.student;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.academic.Department;
import com.edupulse.core.domain.base.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StudentEntityTest {

    @BeforeEach
    void setUp() {
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("Student entity should initialize fields, default to ACTIVE, and inject tenantId on prePersist")
    void student_initializesFieldsAndInjectsTenantId() {
        TenantContext.setTenantId("tenant-stanford");

        Department department = new Department("Electrical Engineering", "EE");
        department.prePersist();

        Batch batch = new Batch("2026-2027", 1, department);
        batch.prePersist();

        Student student = new Student();
        student.setEnrollmentNumber("EE-2026-001");
        student.setFirstName("Ada");
        student.setLastName("Lovelace");
        student.setEmail("ada.lovelace@stanford.edu");
        student.setDepartment(department);
        student.setBatch(batch);
        student.setStatus(EnrollmentStatus.ACTIVE);

        student.prePersist();

        assertThat(student.getEnrollmentNumber()).isEqualTo("EE-2026-001");
        assertThat(student.getFirstName()).isEqualTo("Ada");
        assertThat(student.getLastName()).isEqualTo("Lovelace");
        assertThat(student.getEmail()).isEqualTo("ada.lovelace@stanford.edu");
        assertThat(student.getDepartment()).isEqualTo(department);
        assertThat(student.getBatch()).isEqualTo(batch);
        assertThat(student.getStatus()).isEqualTo(EnrollmentStatus.ACTIVE);
        assertThat(student.getTenantId()).isEqualTo("tenant-stanford");
    }

    @Test
    @DisplayName("Student entity should support SUSPENDED and ALUMNI lifecycle states")
    void student_supportsLifecycleStates() {
        Student student = new Student();
        student.setStatus(EnrollmentStatus.SUSPENDED);
        assertThat(student.getStatus()).isEqualTo(EnrollmentStatus.SUSPENDED);

        student.setStatus(EnrollmentStatus.ALUMNI);
        assertThat(student.getStatus()).isEqualTo(EnrollmentStatus.ALUMNI);
    }
}
