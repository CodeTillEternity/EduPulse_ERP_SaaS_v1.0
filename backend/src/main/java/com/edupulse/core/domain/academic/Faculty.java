package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.base.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/**
 * Academic Faculty domain entity representing teaching staff and instructors.
 * Part of the EduPulse Core multi-tenant academic registry, partitioned by tenantId.
 */
@Entity(name = "AcademicCoreFaculty")
@Table(
        name = "academic_faculties",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_academic_faculty_emp_tenant", columnNames = {"employee_id", "tenant_id"}),
                @UniqueConstraint(name = "uk_academic_faculty_email_tenant", columnNames = {"email", "tenant_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Faculty extends BaseTenantEntity {

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "designation", nullable = false, length = 100)
    private String designation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}
