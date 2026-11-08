package com.edupulse.core.domain.finance;

import com.edupulse.core.domain.base.BaseTenantEntity;
import com.fasterxml.jackson.annotation.JsonBackReference;
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

/**
 * Individual fee structure breakdown item mapping a FeeHead to a specific budgeted amount.
 * Inherits tenant partitioning via BaseTenantEntity.
 */
@Entity(name = "FinanceCoreFeeStructureItem")
@Table(name = "finance_fee_structure_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = {"feeStructure"})
@ToString(callSuper = true, exclude = {"feeStructure"})
public class FeeStructureItem extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_structure_id", nullable = false)
    @JsonBackReference
    private FeeStructure feeStructure;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fee_head_id", nullable = false)
    private FeeHead feeHead;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
}
