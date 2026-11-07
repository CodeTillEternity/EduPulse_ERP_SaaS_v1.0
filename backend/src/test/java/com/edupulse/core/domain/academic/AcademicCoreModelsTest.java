package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.base.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AcademicCoreModelsTest {

    @BeforeEach
    void setUp() {
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("Department should inherit BaseTenantEntity and auto-inject tenantId on prePersist")
    void department_inheritsBaseTenantEntityAndInjectsTenant() {
        TenantContext.setTenantId("tenant-cs");

        Department department = new Department("Computer Science & Engineering", "CSE");
        department.prePersist();

        assertThat(department.getName()).isEqualTo("Computer Science & Engineering");
        assertThat(department.getCode()).isEqualTo("CSE");
        assertThat(department.getTenantId()).isEqualTo("tenant-cs");
    }

    @Test
    @DisplayName("Batch should link to Department and respect tenant context")
    void batch_linksToDepartmentAndInheritsTenantScoping() {
        TenantContext.setTenantId("tenant-eng");

        Department department = new Department("Mechanical Engineering", "MECH");
        department.prePersist();

        Batch batch = new Batch("2026-2027", 1, department);
        batch.prePersist();

        assertThat(batch.getAcademicYear()).isEqualTo("2026-2027");
        assertThat(batch.getCurrentSemester()).isEqualTo(1);
        assertThat(batch.getDepartment()).isEqualTo(department);
        assertThat(batch.getTenantId()).isEqualTo("tenant-eng");
    }
}
