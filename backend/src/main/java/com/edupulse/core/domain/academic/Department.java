package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.base.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Academic Department domain entity representing institutional faculties or branches.
 * Partitioned per tenant and extends BaseTenantEntity for automated boundary scoping.
 */
@Entity(name = "AcademicCoreDepartment")
@Table(
        name = "academic_departments",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_academic_dept_code_tenant", columnNames = {"code", "tenant_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Department extends BaseTenantEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "code", nullable = false, length = 50)
    private String code;
}
