package com.erp.multitenancy.service;

import com.erp.common.exception.BusinessException;
import com.erp.common.storage.StorageService;
import com.erp.multitenancy.dto.TenantBrandingDTO;
import com.erp.multitenancy.entity.TenantBranding;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.repository.TenantBrandingRepository;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;
import java.util.UUID;

/**
 * Service managing white-label visual branding and subdomain resolutions for multi-tenant institutions.
 */
@Service
public class TenantBrandingService {

    private static final Logger log = LoggerFactory.getLogger(TenantBrandingService.class);

    private final TenantBrandingRepository brandingRepository;
    private final TenantRegistryRepository tenantRegistryRepository;
    private final StorageService storageService;

    @Autowired
    public TenantBrandingService(TenantBrandingRepository brandingRepository,
                                 TenantRegistryRepository tenantRegistryRepository,
                                 @Autowired(required = false) StorageService storageService) {
        this.brandingRepository = brandingRepository;
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.storageService = storageService;
    }

    public TenantBrandingService(TenantBrandingRepository brandingRepository,
                                 TenantRegistryRepository tenantRegistryRepository) {
        this(brandingRepository, tenantRegistryRepository, null);
    }

    /**
     * Finds branding data by custom subdomain (e.g. "dps", "stanford").
     * Also checks if the subdomain directly matches a tenant_id as fallback.
     */
    @Cacheable(value = "tenantBranding", key = "#subdomain != null ? #subdomain.trim().toLowerCase() : ''", unless = "#result == null || !#result.isPresent()")
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
     * Clears cached branding entries across all subdomains.
     */
    @CacheEvict(value = "tenantBranding", allEntries = true)
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

    /**
     * Uploads institutional logo directly to AWS S3 and links the CDN URL to tenant branding in PostgreSQL.
     */
    @CacheEvict(value = "tenantBranding", allEntries = true)
    @Transactional
    public String uploadLogo(String tenantId, InputStream inputStream, String contentType, long contentLength, String originalFilename) {
        if (storageService == null) {
            throw new BusinessException("Cloud storage service is not configured");
        }
        TenantRegistry tenant = tenantRegistryRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found with ID: " + tenantId));

        String extension = ".png";
        if (originalFilename != null && originalFilename.lastIndexOf('.') > 0) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String s3Key = "tenants/" + tenantId + "/branding/logo_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        String logoUrl = storageService.uploadFile(s3Key, inputStream, contentType, contentLength);

        TenantBranding branding = brandingRepository.findByTenant_TenantId(tenantId)
                .orElseGet(() -> {
                    TenantBranding tb = new TenantBranding();
                    tb.setTenant(tenant);
                    tb.setCustomSubdomain(tenantId.toLowerCase());
                    tb.setInstitutionName(tenant.getInstitutionName());
                    return tb;
                });

        branding.setLogoUrl(logoUrl);
        brandingRepository.save(branding);
        log.info("Uploaded tenant logo to S3 and persisted CDN URL for tenant [{}]: [{}]", tenantId, logoUrl);
        return logoUrl;
    }

    @Transactional
    public String uploadLogo(String tenantId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Logo file cannot be empty");
        }
        try {
            return uploadLogo(tenantId, file.getInputStream(), file.getContentType(), file.getSize(), file.getOriginalFilename());
        } catch (IOException e) {
            throw new BusinessException("Failed to read logo input stream: " + e.getMessage());
        }
    }

    /**
     * Uploads institutional favicon directly to AWS S3 and links the CDN URL to tenant branding in PostgreSQL.
     */
    @CacheEvict(value = "tenantBranding", allEntries = true)
    @Transactional
    public String uploadFavicon(String tenantId, InputStream inputStream, String contentType, long contentLength, String originalFilename) {
        if (storageService == null) {
            throw new BusinessException("Cloud storage service is not configured");
        }
        TenantRegistry tenant = tenantRegistryRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found with ID: " + tenantId));

        String extension = ".ico";
        if (originalFilename != null && originalFilename.lastIndexOf('.') > 0) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String s3Key = "tenants/" + tenantId + "/branding/favicon_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        String faviconUrl = storageService.uploadFile(s3Key, inputStream, contentType, contentLength);

        TenantBranding branding = brandingRepository.findByTenant_TenantId(tenantId)
                .orElseGet(() -> {
                    TenantBranding tb = new TenantBranding();
                    tb.setTenant(tenant);
                    tb.setCustomSubdomain(tenantId.toLowerCase());
                    tb.setInstitutionName(tenant.getInstitutionName());
                    return tb;
                });

        branding.setFaviconUrl(faviconUrl);
        brandingRepository.save(branding);
        log.info("Uploaded tenant favicon to S3 and persisted CDN URL for tenant [{}]: [{}]", tenantId, faviconUrl);
        return faviconUrl;
    }

    @Transactional
    public String uploadFavicon(String tenantId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Favicon file cannot be empty");
        }
        try {
            return uploadFavicon(tenantId, file.getInputStream(), file.getContentType(), file.getSize(), file.getOriginalFilename());
        } catch (IOException e) {
            throw new BusinessException("Failed to read favicon input stream: " + e.getMessage());
        }
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

