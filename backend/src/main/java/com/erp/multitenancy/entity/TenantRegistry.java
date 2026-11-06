package com.erp.multitenancy.entity;

import com.erp.multitenancy.model.TenantStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA entity representing tenant control plane registration and provisioning metadata.
 * Mapped to the tenant_registry table.
 */
@Entity
@Table(name = "tenant_registry")
public class TenantRegistry {

    @Id
    @Column(name = "tenant_id", length = 64, nullable = false)
    private String tenantId;

    @Column(name = "institution_name", nullable = false)
    private String institutionName;

    @Column(name = "admin_email")
    private String adminEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "tenant_status", nullable = false)
    private TenantStatus status = TenantStatus.REGISTERED;

    @Column(name = "database_mode", nullable = false)
    private String databaseMode = "SHARED";

    @Column(name = "trial_end_date")
    private LocalDateTime trialEndDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TenantRegistry() {}

    public TenantRegistry(String tenantId, String institutionName, TenantStatus status, String databaseMode) {
        this.tenantId = tenantId;
        this.institutionName = institutionName;
        this.status = status;
        this.databaseMode = (databaseMode != null && !databaseMode.isBlank()) ? databaseMode : "SHARED";
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (databaseMode == null || databaseMode.isBlank()) {
            databaseMode = "SHARED";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public TenantStatus getStatus() {
        return status;
    }

    public void setStatus(TenantStatus status) {
        this.status = status;
    }

    public String getDatabaseMode() {
        return databaseMode;
    }

    public void setDatabaseMode(String databaseMode) {
        this.databaseMode = databaseMode;
    }

    public LocalDateTime getTrialEndDate() {
        return trialEndDate;
    }

    public void setTrialEndDate(LocalDateTime trialEndDate) {
        this.trialEndDate = trialEndDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
