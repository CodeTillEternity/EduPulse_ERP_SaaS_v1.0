package com.edupulse.core.domain.finance;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.Student;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class StudentInvoiceTest {

    private static final String TENANT_ID = "tenant-fin-002";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("StudentInvoice calculates outstanding balances and updates status on payment")
    void shouldHandleInvoiceLifecycleAndPayments() {
        Student student = new Student();
        student.setId(101L);
        student.setEnrollmentNumber("ENR-2026-001");
        student.setFirstName("Ada");
        student.setLastName("Lovelace");

        Batch batch = new Batch();
        batch.setId(1L);

        FeeStructure feeStructure = new FeeStructure();
        feeStructure.setId(5L);
        feeStructure.setName("B.Tech CS Annual");
        feeStructure.setTotalAmount(new BigDecimal("50000.00"));
        feeStructure.setBatch(batch);

        StudentInvoice invoice = new StudentInvoice();
        invoice.setInvoiceNumber("INV-2026-0001");
        invoice.setStudent(student);
        invoice.setFeeStructure(feeStructure);
        invoice.setGrossAmount(new BigDecimal("50000.00"));
        invoice.setDiscount(new BigDecimal("5000.00"));
        invoice.setNetAmount(new BigDecimal("45000.00"));
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setDueDate(LocalDate.now().plusMonths(1));
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice.prePersist();

        assertThat(invoice.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(invoice.getOutstandingBalance()).isEqualByComparingTo(new BigDecimal("45000.00"));
        assertThat(invoice.getStatus()).isEqualTo(InvoiceStatus.UNPAID);

        // Apply Partial Payment of 20000
        invoice.applyPayment(new BigDecimal("20000.00"));
        assertThat(invoice.getAmountPaid()).isEqualByComparingTo(new BigDecimal("20000.00"));
        assertThat(invoice.getOutstandingBalance()).isEqualByComparingTo(new BigDecimal("25000.00"));
        assertThat(invoice.getStatus()).isEqualTo(InvoiceStatus.PARTIAL);

        // Create transaction record
        FeePayment payment1 = new FeePayment(invoice, new BigDecimal("20000.00"), "UPI", "UPI-REF-12345", java.time.LocalDateTime.now(), "First installment");
        payment1.prePersist();
        assertThat(payment1.getTenantId()).isEqualTo(TENANT_ID);

        // Apply Final Payment of 25000
        invoice.applyPayment(new BigDecimal("25000.00"));
        assertThat(invoice.getAmountPaid()).isEqualByComparingTo(new BigDecimal("45000.00"));
        assertThat(invoice.getOutstandingBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(invoice.getStatus()).isEqualTo(InvoiceStatus.PAID);
    }
}
