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

/**
 * Academic Batch domain entity capturing student cohorts for an academic year.
 * Belongs to an Academic Department and partitions automatically under the tenant boundary.
 */
@Entity(name = "AcademicCoreBatch")
@Table(name = "academic_batches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Batch extends BaseTenantEntity {

    @Column(name = "academic_year", nullable = false, length = 50)
    private String academicYear;

    @Column(name = "current_semester")
    private Integer currentSemester;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}
