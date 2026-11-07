package com.edupulse.core.domain.student;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.academic.Department;
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

/**
 * Student domain entity representing an enrolled student within an institution.
 * Extends BaseTenantEntity to ensure automated multi-tenant boundary scoping.
 * The enrollmentNumber is strictly unique per institutional tenant partition.
 */
@Entity(name = "AcademicCoreStudent")
@Table(
        name = "academic_core_students",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_core_student_enrollment_tenant", columnNames = {"enrollment_number", "tenant_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Student extends BaseTenantEntity {

    @Column(name = "enrollment_number", nullable = false, length = 50)
    private String enrollmentNumber;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;
}
