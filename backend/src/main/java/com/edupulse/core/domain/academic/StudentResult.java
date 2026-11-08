package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.base.BaseTenantEntity;
import com.edupulse.core.domain.student.Student;
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

import java.math.BigDecimal;

/**
 * StudentResult domain entity representing an individual student's evaluation,
 * marks obtained, grade label, and grade point for an examination.
 * Automatically partitioned by tenantId via BaseTenantEntity.
 */
@Entity(name = "AcademicCoreStudentResult")
@Table(
        name = "academic_student_results",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_core_student_result_exam_student_tenant",
                        columnNames = {"exam_id", "student_id", "tenant_id"}
                )
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class StudentResult extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Column(name = "marks_obtained", nullable = false, precision = 7, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "grade_label", length = 10)
    private String gradeLabel;

    @Column(name = "grade_point", precision = 4, scale = 2)
    private BigDecimal gradePoint;

    @Column(name = "remarks", length = 255)
    private String remarks;
}
