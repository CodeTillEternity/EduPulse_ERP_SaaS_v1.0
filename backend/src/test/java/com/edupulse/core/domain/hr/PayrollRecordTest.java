package com.edupulse.core.domain.hr;

import com.edupulse.core.domain.academic.Faculty;
import com.edupulse.core.domain.base.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class PayrollRecordTest {

    private static final String TENANT_ID = "tenant-hr-payroll-001";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("PayrollRecord computes net salary and sets tenant partition on prePersist")
    void shouldCreateAndCalculatePayrollRecord() {
        Faculty faculty = new Faculty();
        faculty.setId(5L);
        faculty.setEmployeeId("FAC-2026-005");
        faculty.setFirstName("Grace");
        faculty.setLastName("Hopper");

        PayrollRecord record = new PayrollRecord();
        record.setFaculty(faculty);
        record.setMonth(11);
        record.setYear(2026);
        record.setBaseSalary(new BigDecimal("75000.00"));
        record.setDeductions(new BigDecimal("5000.00"));
        record.calculateNetSalary();
        record.setStatus(PayrollStatus.GENERATED);
        record.prePersist();

        assertThat(record.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(record.getMonth()).isEqualTo(11);
        assertThat(record.getYear()).isEqualTo(2026);
        assertThat(record.getBaseSalary()).isEqualByComparingTo("75000.00");
        assertThat(record.getDeductions()).isEqualByComparingTo("5000.00");
        assertThat(record.getNetSalary()).isEqualByComparingTo("70000.00");
        assertThat(record.getStatus()).isEqualTo(PayrollStatus.GENERATED);
        assertThat(record.getPaymentDate()).isNull();

        // Mark as paid
        record.setStatus(PayrollStatus.PAID);
        record.setPaymentDate(LocalDate.of(2026, 11, 30));
        assertThat(record.getStatus()).isEqualTo(PayrollStatus.PAID);
        assertThat(record.getPaymentDate()).isEqualTo(LocalDate.of(2026, 11, 30));
    }
}
