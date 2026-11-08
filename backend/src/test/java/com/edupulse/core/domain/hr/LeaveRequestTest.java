package com.edupulse.core.domain.hr;

import com.edupulse.core.domain.academic.Faculty;
import com.edupulse.core.domain.base.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class LeaveRequestTest {

    private static final String TENANT_ID = "tenant-hr-001";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("LeaveRequest inherits BaseTenantEntity and computes duration correctly")
    void shouldCreateLeaveRequest() {
        Faculty faculty = new Faculty();
        faculty.setId(10L);
        faculty.setEmployeeId("FAC-2026-001");
        faculty.setFirstName("Alan");
        faculty.setLastName("Turing");

        LocalDate start = LocalDate.of(2026, 11, 10);
        LocalDate end = LocalDate.of(2026, 11, 14);

        LeaveRequest leave = new LeaveRequest();
        leave.setFaculty(faculty);
        leave.setStartDate(start);
        leave.setEndDate(end);
        leave.setReason("Attending ACM Computer Science Symposium");
        leave.setStatus(LeaveStatus.PENDING);
        leave.prePersist();

        assertThat(leave.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(leave.getStatus()).isEqualTo(LeaveStatus.PENDING);
        assertThat(leave.getDaysCount()).isEqualTo(5);
        assertThat(leave.getFaculty().getEmployeeId()).isEqualTo("FAC-2026-001");
    }
}
