package com.erp.multitenancy.entity;

import com.erp.multitenancy.model.AccountStatus;
import com.erp.multitenancy.model.TenantStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Central SaaS Tenant Registry entity.
 * Sits globally above all tenants and partitions, managing institutional lifecycle,
 * subdomains, subscription tiers, and database routing.
 * <p>
 * NOTE: This entity must NOT implement BaseTenantEntity as it represents the SaaS Control Plane.
 */
@Entity
@Table(
    name = "tenant_registry",
    indexes = {
        @Index(name = "idx_tenant_registry_subdomain", columnList = "subdomain"),
        @Index(name = "idx_tenant_registry_account_status", columnList = "account_status"),
        @Index(name = "idx_tenant_registry_stripe_customer", columnList = "stripe_customer_id")
    }
)
public class TenantRegistry {

    @Id
    @Column(name = "tenant_id", length = 64, nullable = false)
    private String tenantId;

    @Column(name = "institution_name", nullable = false)
    private String institutionName;

    @Column(name = "subdomain", unique = true)
    private String subdomain;

    @Column(name = "subscription_tier", length = 32)
    private String subscriptionTier = "TRIAL";

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private AccountStatus accountStatus = AccountStatus.TRIAL;

    @Column(name = "trial_end_date")
    private LocalDateTime trialEndDate;

    @Column(name = "current_period_end")
    private LocalDateTime currentPeriodEnd;

    @Column(name = "stripe_customer_id", length = 64)
    private String stripeCustomerId;

    @Column(name = "stripe_subscription_id", length = 64)
    private String stripeSubscriptionId;

    @Column(name = "database_routing_key", length = 64)
    private String databaseRoutingKey = "SHARED_DEFAULT";

    // Legacy and operational metadata for platform backwards compatibility
    @Column(name = "admin_email")
    private String adminEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "tenant_status")
    private TenantStatus status = TenantStatus.REGISTERED;

    @Column(name = "database_mode", length = 32)
    private String databaseMode = "SHARED";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "tenant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private TenantBranding branding;

    public TenantRegistry() {}

    public TenantRegistry(String tenantId, String institutionName, String subdomain, String subscriptionTier, AccountStatus accountStatus) {
        this.tenantId = tenantId;
        this.institutionName = institutionName;
        this.subdomain = subdomain;
        this.subscriptionTier = subscriptionTier != null ? subscriptionTier : "TRIAL";
        this.accountStatus = accountStatus != null ? accountStatus : AccountStatus.TRIAL;
        syncLegacyStatus(this.accountStatus);
    }

    public TenantRegistry(String tenantId, String institutionName, TenantStatus status, String databaseMode) {
        this.tenantId = tenantId;
        this.institutionName = institutionName;
        this.status = status;
        this.databaseMode = (databaseMode != null && !databaseMode.isBlank()) ? databaseMode : "SHARED";
        this.databaseRoutingKey = this.databaseMode;
        syncAccountStatusFromLegacy(status);
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (accountStatus == null) {
            accountStatus = AccountStatus.TRIAL;
        }
        if (subscriptionTier == null || subscriptionTier.isBlank()) {
            subscriptionTier = "TRIAL";
        }
        if (databaseRoutingKey == null || databaseRoutingKey.isBlank()) {
            databaseRoutingKey = (databaseMode != null && !databaseMode.isBlank()) ? databaseMode : "SHARED_DEFAULT";
        }
        if (databaseMode == null || databaseMode.isBlank()) {
            databaseMode = databaseRoutingKey;
        }
        if (subdomain == null && tenantId != null) {
            subdomain = tenantId.toLowerCase().replaceAll("[^a-z0-9-]", "");
        }
        syncLegacyStatus(accountStatus);
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        syncLegacyStatus(accountStatus);
    }

    private void syncLegacyStatus(AccountStatus accStatus) {
        if (accStatus == null) return;
        switch (accStatus) {
            case TRIAL -> this.status = TenantStatus.TRIAL_ACTIVE;
            case ACTIVE -> this.status = TenantStatus.ACTIVE;
            case SUSPENDED -> this.status = TenantStatus.SUSPENDED;
        }
    }

    private void syncAccountStatusFromLegacy(TenantStatus legStatus) {
        if (legStatus == null) return;
        switch (legStatus) {
            case SUSPENDED -> this.accountStatus = AccountStatus.SUSPENDED;
            case ACTIVE -> this.accountStatus = AccountStatus.ACTIVE;
            default -> this.accountStatus = AccountStatus.TRIAL;
        }
    }

    // Getters and Setters

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

    public String getSubdomain() {
        return subdomain;
    }

    public void setSubdomain(String subdomain) {
        this.subdomain = subdomain;
    }

    public String getSubscriptionTier() {
        return subscriptionTier;
    }

    public void setSubscriptionTier(String subscriptionTier) {
        this.subscriptionTier = subscriptionTier;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
        syncLegacyStatus(accountStatus);
    }

    public LocalDateTime getTrialEndDate() {
        return trialEndDate;
    }

    public void setTrialEndDate(LocalDateTime trialEndDate) {
        this.trialEndDate = trialEndDate;
    }

    public LocalDateTime getCurrentPeriodEnd() {
        return currentPeriodEnd;
    }

    public void setCurrentPeriodEnd(LocalDateTime currentPeriodEnd) {
        this.currentPeriodEnd = currentPeriodEnd;
    }

    public String getStripeCustomerId() {
        return stripeCustomerId;
    }

    public void setStripeCustomerId(String stripeCustomerId) {
        this.stripeCustomerId = stripeCustomerId;
    }

    public String getStripeSubscriptionId() {
        return stripeSubscriptionId;
    }

    public void setStripeSubscriptionId(String stripeSubscriptionId) {
        this.stripeSubscriptionId = stripeSubscriptionId;
    }

    public String getDatabaseRoutingKey() {
        return databaseRoutingKey;
    }

    public void setDatabaseRoutingKey(String databaseRoutingKey) {
        this.databaseRoutingKey = databaseRoutingKey;
        if (databaseRoutingKey != null && (this.databaseMode == null || this.databaseMode.isBlank())) {
            this.databaseMode = databaseRoutingKey;
        }
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
        syncAccountStatusFromLegacy(status);
    }

    public String getDatabaseMode() {
        return databaseMode;
    }

    public void setDatabaseMode(String databaseMode) {
        this.databaseMode = databaseMode;
        if (databaseMode != null && (this.databaseRoutingKey == null || this.databaseRoutingKey.isBlank())) {
            this.databaseRoutingKey = databaseMode;
        }
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

    public TenantBranding getBranding() {
        return branding;
    }

    public void setBranding(TenantBranding branding) {
        this.branding = branding;
        if (branding != null && branding.getTenant() != this) {
            branding.setTenant(this);
        }
    }
}
