package com.edupulse.core.domain.hr;

import com.edupulse.core.domain.academic.Faculty;
import com.edupulse.core.domain.base.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * PayrollRecord domain entity representing monthly salary compensation and deductions for faculty.
 * Automatically partitioned by tenantId via BaseTenantEntity.
 */
@Entity(name = "HRCorePayrollRecord")
@Table(
        name = "hr_payroll_records",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_core_payroll_faculty_period_tenant",
                        columnNames = {"faculty_id", "payroll_month", "payroll_year", "tenant_id"}
                )
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class PayrollRecord extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @Column(name = "payroll_month", nullable = false)
    private Integer month;

    @Column(name = "payroll_year", nullable = false)
    private Integer year;

    @Column(name = "base_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "deductions", nullable = false, precision = 12, scale = 2)
    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PayrollStatus status = PayrollStatus.GENERATED;

    public void calculateNetSalary() {
        BigDecimal base = baseSalary != null ? baseSalary : BigDecimal.ZERO;
        BigDecimal ded = deductions != null ? deductions : BigDecimal.ZERO;
        this.netSalary = base.subtract(ded).max(BigDecimal.ZERO);
    }
}
