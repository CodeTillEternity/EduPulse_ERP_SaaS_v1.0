package com.edupulse.core.domain.finance;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.base.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class FeeStructureTest {

    private static final String TENANT_ID = "tenant-fin-001";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("FeeHead and FeeStructure inherit BaseTenantEntity and link items accurately")
    void shouldCreateFeeStructureWithItems() {
        FeeHead tuition = new FeeHead("Tuition Fee", "Standard Academic Tuition", true);
        tuition.prePersist();

        FeeHead lab = new FeeHead("Lab Fee", "Computer & Electronics Lab", true);
        lab.prePersist();

        assertThat(tuition.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(lab.getTenantId()).isEqualTo(TENANT_ID);

        Batch batch = new Batch();
        batch.setId(10L);
        batch.setAcademicYear("2026-2027");

        FeeStructure structure = new FeeStructure();
        structure.setName("Engineering 2026 Annual Fee");
        structure.setTotalAmount(new BigDecimal("75000.00"));
        structure.setBatch(batch);
        structure.prePersist();

        FeeStructureItem item1 = new FeeStructureItem(structure, tuition, new BigDecimal("60000.00"));
        item1.prePersist();

        FeeStructureItem item2 = new FeeStructureItem(structure, lab, new BigDecimal("15000.00"));
        item2.prePersist();

        structure.addItem(item1);
        structure.addItem(item2);

        assertThat(structure.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(structure.getItems()).hasSize(2);
        assertThat(structure.getTotalAmount()).isEqualByComparingTo(new BigDecimal("75000.00"));
        assertThat(item1.getFeeStructure()).isEqualTo(structure);
        assertThat(item2.getFeeHead()).isEqualTo(lab);
    }
}
