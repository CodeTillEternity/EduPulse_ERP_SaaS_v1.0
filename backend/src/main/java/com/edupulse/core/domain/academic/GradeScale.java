package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.base.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * GradeScale domain entity defining the grading criteria, mark ranges,
 * and associated Grade Point Averages (GPA/grade point) for an institutional tenant.
 */
@Entity(name = "AcademicCoreGradeScale")
@Table(name = "academic_grade_scales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class GradeScale extends BaseTenantEntity {

    @Column(name = "grade", nullable = false, length = 10)
    private String grade;

    @Column(name = "min_marks", nullable = false, precision = 7, scale = 2)
    private BigDecimal minMarks;

    @Column(name = "max_marks", nullable = false, precision = 7, scale = 2)
    private BigDecimal maxMarks;

    @Column(name = "grade_point", nullable = false, precision = 4, scale = 2)
    private BigDecimal gradePoint;
}
