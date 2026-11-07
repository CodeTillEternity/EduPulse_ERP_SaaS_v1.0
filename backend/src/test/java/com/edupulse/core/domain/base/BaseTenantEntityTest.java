package com.edupulse.core.domain.base;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BaseTenantEntityTest {

    private static class ConcreteTestEntity extends BaseTenantEntity {
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    @BeforeEach
    void setUp() {
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("PrePersist should automatically inject active tenant from TenantContext")
    void prePersist_injectsActiveTenantId() {
        TenantContext.setTenantId("tenant-oxford");
        ConcreteTestEntity entity = new ConcreteTestEntity();
        entity.setName("Computer Science");

        entity.prePersist();

        assertThat(entity.getTenantId()).isEqualTo("tenant-oxford");
    }

    @Test
    @DisplayName("PrePersist should fall back to default when TenantContext is unset")
    void prePersist_fallsBackToDefaultWhenContextEmpty() {
        TenantContext.clear();
        ConcreteTestEntity entity = new ConcreteTestEntity();

        entity.prePersist();

        assertThat(entity.getTenantId()).isEqualTo("default");
    }

    @Test
    @DisplayName("PrePersist should preserve existing tenantId if already populated")
    void prePersist_preservesPreconfiguredTenantId() {
        TenantContext.setTenantId("tenant-context");
        ConcreteTestEntity entity = new ConcreteTestEntity();
        entity.setTenantId("tenant-explicit");

        entity.prePersist();

        assertThat(entity.getTenantId()).isEqualTo("tenant-explicit");
    }
}
