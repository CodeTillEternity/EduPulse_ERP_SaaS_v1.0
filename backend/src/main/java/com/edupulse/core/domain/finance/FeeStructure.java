package com.edupulse.core.domain.finance;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.base.BaseTenantEntity;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * FeeStructure domain entity defining the annual or semester tuition & service charge blueprint
 * configured for an academic Batch.
 */
@Entity(name = "FinanceCoreFeeStructure")
@Table(name = "finance_fee_structures")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = {"items"})
@ToString(callSuper = true, exclude = {"items"})
public class FeeStructure extends BaseTenantEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @OneToMany(mappedBy = "feeStructure", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<FeeStructureItem> items = new ArrayList<>();

    public void addItem(FeeStructureItem item) {
        items.add(item);
        item.setFeeStructure(this);
    }

    public void removeItem(FeeStructureItem item) {
        items.remove(item);
        item.setFeeStructure(null);
    }
}
