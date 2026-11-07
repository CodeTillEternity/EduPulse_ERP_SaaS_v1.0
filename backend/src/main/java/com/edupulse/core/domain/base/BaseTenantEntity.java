package com.edupulse.core.domain.base;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.TenantId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Base abstract mapped superclass for all multi-tenant entities in EduPulse SaaS.
 * Automatically injects the active tenant identity before persistence to ensure
 * zero data leakage across institutional boundaries without manual developer intervention.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseTenantEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @TenantId
    @Column(name = "tenant_id", length = 64, nullable = false, updatable = false)
    private String tenantId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * JPA lifecycle callback executed prior to entity persistence.
     * Extracts tenant identifier from the ThreadLocal TenantContext and attaches it
     * directly to the entity.
     */
    @PrePersist
    public void prePersist() {
        if (this.tenantId == null || this.tenantId.isBlank()) {
            String currentTenant = TenantContext.getTenantId();
            if (currentTenant != null && !currentTenant.isBlank()) {
                this.tenantId = currentTenant;
            } else {
                this.tenantId = "default";
            }
        }
    }
}
