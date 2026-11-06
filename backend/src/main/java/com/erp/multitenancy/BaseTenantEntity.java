package com.erp.multitenancy;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import org.hibernate.annotations.TenantId;

import java.io.Serializable;

/**
 * Generic mapped superclass providing Hibernate @TenantId multi-tenancy partitioning.
 */
@MappedSuperclass
public abstract class BaseTenantEntity implements Serializable {

    @TenantId
    @Column(name = "tenant_id", length = 64)
    private String tenantId;

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
}
