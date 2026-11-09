package com.erp.multitenancy.service;

import com.erp.multitenancy.dto.TenantBrandingDTO;
import com.erp.multitenancy.entity.TenantBranding;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.repository.TenantBrandingRepository;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service managing white-label visual branding and subdomain resolutions for multi-tenant institutions.
 */
@Service
public class TenantBrandingService {

    private static final Logger log = LoggerFactory.getLogger(TenantBrandingService.class);

    private final TenantBrandingRepository brandingRepository;
    private final TenantRegistryRepository tenantRegistryRepository;

    public TenantBrandingService(TenantBrandingRepository brandingRepository,
                                 TenantRegistryRepository tenantRegistryRepository) {
        this.brandingRepository = brandingRepository;
        this.tenantRegistryRepository = tenantRegistryRepository;
    }

    /**
     * Finds branding data by custom subdomain (e.g. "dps", "stanford").
     * Also checks if the subdomain directly matches a tenant_id as fallback.
     */
    @Transactional(readOnly = true)
    public Optional<TenantBrandingDTO> getBrandingBySubdomain(String subdomain) {
        if (subdomain == null || subdomain.isBlank()) {
            return Optional.empty();
        }

        String normalized = subdomain.trim().toLowerCase();

        // 1. Direct match on customSubdomain
        Optional<TenantBranding> brandingOpt = brandingRepository.findByCustomSubdomainIgnoreCase(normalized);
        if (brandingOpt.isPresent()) {
            return brandingOpt.map(this::toDTO);
        }

        // 2. Fallback match by tenant_id
        brandingOpt = brandingRepository.findByTenant_TenantIdIgnoreCase(normalized);
        if (brandingOpt.isPresent()) {
            return brandingOpt.map(this::toDTO);
        }

        // 3. Fallback: Check if TenantRegistry exists for tenant_id and generate baseline branding
        Optional<TenantRegistry> tenantOpt = tenantRegistryRepository.findById(normalized);
        if (tenantOpt.isPresent()) {
            TenantRegistry tenant = tenantOpt.get();
            return Optional.of(new TenantBrandingDTO(
                    tenant.getTenantId(),
                    tenant.getInstitutionName(),
                    normalized,
                    null,
                    null,
                    "#0F172A",
                    "#38BDF8"
            ));
        }

        return Optional.empty();
    }

    /**
     * Finds branding data by tenant ID.
     */
    @Transactional(readOnly = true)
    public Optional<TenantBrandingDTO> getBrandingByTenantId(String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            return Optional.empty();
        }
        return brandingRepository.findByTenant_TenantIdIgnoreCase(tenantId.trim())
                .map(this::toDTO);
    }

    /**
     * Persists or updates tenant white-label branding configuration.
     */
    @Transactional
    public TenantBrandingDTO saveOrUpdateBranding(String tenantId,
                                                  String customSubdomain,
                                                  String logoUrl,
                                                  String faviconUrl,
                                                  String primaryColorHex,
                                                  String secondaryColorHex) {
        TenantRegistry tenant = tenantRegistryRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found with ID: " + tenantId));

        String normalizedSubdomain = (customSubdomain != null && !customSubdomain.isBlank())
                ? customSubdomain.trim().toLowerCase()
                : tenantId.trim().toLowerCase();

        TenantBranding branding = brandingRepository.findByTenant_TenantId(tenantId)
                .orElseGet(() -> {
                    TenantBranding tb = new TenantBranding();
                    tb.setTenant(tenant);
                    return tb;
                });

        branding.setCustomSubdomain(normalizedSubdomain);
        branding.setLogoUrl(logoUrl);
        branding.setFaviconUrl(faviconUrl);
        branding.setPrimaryColorHex(primaryColorHex);
        branding.setSecondaryColorHex(secondaryColorHex);
        branding.setInstitutionName(tenant.getInstitutionName());

        TenantBranding saved = brandingRepository.save(branding);
        log.info("Saved branding configuration for tenant [{}] with subdomain [{}]", tenantId, normalizedSubdomain);
        return toDTO(saved);
    }

    public TenantBrandingDTO toDTO(TenantBranding branding) {
        return new TenantBrandingDTO(
                branding.getTenantId(),
                branding.getInstitutionName(),
                branding.getCustomSubdomain(),
                branding.getLogoUrl(),
                branding.getFaviconUrl(),
                branding.getPrimaryColorHex(),
                branding.getSecondaryColorHex()
        );
    }
}
