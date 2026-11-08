package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.base.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Exam domain entity representing scheduled examinations, tests, or assessments
 * tied to a specific CourseOffering. Automatically isolated by tenantId via BaseTenantEntity.
 */
@Entity(name = "AcademicCoreExam")
@Table(name = "academic_exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Exam extends BaseTenantEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "total_marks", nullable = false, precision = 7, scale = 2)
    private BigDecimal totalMarks;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_offering_id", nullable = false)
    private CourseOffering courseOffering;
}
