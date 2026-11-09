package com.erp.multitenancy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * JPA entity representing tenant-specific white-label branding and visual identity.
 * Linked 1:1 with the institutional TenantRegistry entity.
 */
@Entity
@Table(name = "tenant_branding")
public class TenantBranding implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", referencedColumnName = "tenant_id", nullable = false)
    private TenantRegistry tenant;

    @Column(name = "custom_subdomain", nullable = false, unique = true, length = 100)
    private String customSubdomain;

    @Column(name = "institution_name")
    private String institutionName;

    @Column(name = "logo_url", length = 1000)
    private String logoUrl;

    @Column(name = "favicon_url", length = 1000)
    private String faviconUrl;

    @Column(name = "primary_color_hex", length = 20)
    private String primaryColorHex;

    @Column(name = "secondary_color_hex", length = 20)
    private String secondaryColorHex;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TenantBranding() {}

    public TenantBranding(TenantRegistry tenant, String customSubdomain, String logoUrl,
                          String faviconUrl, String primaryColorHex, String secondaryColorHex) {
        this.tenant = tenant;
        this.customSubdomain = customSubdomain;
        this.logoUrl = logoUrl;
        this.faviconUrl = faviconUrl;
        this.primaryColorHex = primaryColorHex;
        this.secondaryColorHex = secondaryColorHex;
        if (tenant != null && this.institutionName == null) {
            this.institutionName = tenant.getInstitutionName();
        }
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (institutionName == null && tenant != null) {
            institutionName = tenant.getInstitutionName();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TenantRegistry getTenant() {
        return tenant;
    }

    public void setTenant(TenantRegistry tenant) {
        this.tenant = tenant;
        if (tenant != null && this.institutionName == null) {
            this.institutionName = tenant.getInstitutionName();
        }
    }

    public String getTenantId() {
        return tenant != null ? tenant.getTenantId() : null;
    }

    public String getCustomSubdomain() {
        return customSubdomain;
    }

    public void setCustomSubdomain(String customSubdomain) {
        this.customSubdomain = customSubdomain;
    }

    public String getInstitutionName() {
        return institutionName != null ? institutionName : (tenant != null ? tenant.getInstitutionName() : null);
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getFaviconUrl() {
        return faviconUrl;
    }

    public void setFaviconUrl(String faviconUrl) {
        this.faviconUrl = faviconUrl;
    }

    public String getPrimaryColorHex() {
        return primaryColorHex;
    }

    public void setPrimaryColorHex(String primaryColorHex) {
        this.primaryColorHex = primaryColorHex;
    }

    public String getSecondaryColorHex() {
        return secondaryColorHex;
    }

    public void setSecondaryColorHex(String secondaryColorHex) {
        this.secondaryColorHex = secondaryColorHex;
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
