package com.edupulse.core.domain.finance;

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
 * FeeHead domain entity representing a fee ledger category (e.g. Tuition Fee, Lab Fee, Library Fee).
 * Partitions automatically under multi-tenant boundary.
 */
@Entity(name = "FinanceCoreFeeHead")
@Table(
        name = "finance_fee_heads",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_core_fee_head_name_tenant", columnNames = {"name", "tenant_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class FeeHead extends BaseTenantEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
