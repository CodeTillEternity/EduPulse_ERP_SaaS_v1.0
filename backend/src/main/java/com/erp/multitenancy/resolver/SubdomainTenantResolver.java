package com.erp.multitenancy.resolver;

import com.erp.multitenancy.entity.TenantBranding;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.repository.TenantBrandingRepository;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Enterprise Subdomain and Tenant Resolution Service.
 * <p>
 * Extracts institution subdomains from Host headers, reverse-proxy headers, or explicit client headers,
 * and cryptographically resolves the authoritative tenant_id namespace.
 */
@Component
public class SubdomainTenantResolver {

    private static final Logger log = LoggerFactory.getLogger(SubdomainTenantResolver.class);

    private static final Set<String> RESERVED_SUBDOMAINS = new HashSet<>(Arrays.asList(
            "www", "api", "app", "admin", "saas", "mail", "smtp", "auth", "login",
            "localhost", "127.0.0.1", "edupulse", "cdn", "assets", "static", "portal"
    ));

    private final TenantRegistryRepository tenantRegistryRepository;
    private final TenantBrandingRepository tenantBrandingRepository;

    @Autowired
    public SubdomainTenantResolver(
            TenantRegistryRepository tenantRegistryRepository,
            TenantBrandingRepository tenantBrandingRepository) {
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.tenantBrandingRepository = tenantBrandingRepository;
    }

    /**
     * Extracts the raw subdomain identifier from the HTTP request.
     * Checks headers first, then falls back to Host/X-Forwarded-Host parsing.
     *
     * @param request the incoming HttpServletRequest
     * @return Optional containing the normalized subdomain, or empty
     */
    public Optional<String> extractSubdomain(HttpServletRequest request) {
        if (request == null) {
            return Optional.empty();
        }

        // 1. Explicit request headers
        String headerSubdomain = request.getHeader("X-Tenant-Subdomain");
        if (isValidSubdomain(headerSubdomain)) {
            return Optional.of(headerSubdomain.trim().toLowerCase());
        }

        String altHeader = request.getHeader("X-Subdomain");
        if (isValidSubdomain(altHeader)) {
            return Optional.of(altHeader.trim().toLowerCase());
        }

        // 2. Query parameter fallback (useful for redirects and webhooks)
        String querySubdomain = request.getParameter("subdomain");
        if (isValidSubdomain(querySubdomain)) {
            return Optional.of(querySubdomain.trim().toLowerCase());
        }

        // 3. Host / X-Forwarded-Host parsing
        String host = request.getHeader("X-Forwarded-Host");
        if (host == null || host.isBlank()) {
            host = request.getHeader("Host");
        }
        if (host == null || host.isBlank()) {
            host = request.getServerName();
        }

        if (host != null && !host.isBlank()) {
            // Strip port if present
            int colonIndex = host.indexOf(':');
            if (colonIndex > 0) {
                host = host.substring(0, colonIndex);
            }
            host = host.trim().toLowerCase();

            String[] parts = host.split("\\.");
            // e.g. "dps.edupulse.com" -> 3 parts, subdomain = "dps"
            // "stanford.localhost" -> 2 parts, subdomain = "stanford"
            if (parts.length >= 2) {
                String candidate = parts[0].trim().toLowerCase();
                if (isValidSubdomain(candidate)) {
                    return Optional.of(candidate);
                }
            }
        }

        return Optional.empty();
    }

    /**
     * Resolves the authoritative tenantId from the incoming request.
     * Cross-references TenantRegistry and TenantBranding registries.
     *
     * @param request the incoming HttpServletRequest
     * @return Optional containing the verified tenantId
     */
    public Optional<String> resolveTenantId(HttpServletRequest request) {
        if (request == null) {
            return Optional.empty();
        }

        // 1. Check direct X-Tenant-ID header if provided
        String tenantHeader = request.getHeader("X-Tenant-ID");
        if (tenantHeader != null && !tenantHeader.isBlank()) {
            String trimmedHeader = tenantHeader.trim();
            if (tenantRegistryRepository.existsById(trimmedHeader)) {
                return Optional.of(trimmedHeader);
            }
        }

        // 2. Extract subdomain and resolve
        Optional<String> subdomainOpt = extractSubdomain(request);
        if (subdomainOpt.isEmpty()) {
            return Optional.empty();
        }

        String subdomain = subdomainOpt.get();

        // 2a. Check TenantRegistry by tenantId directly (e.g. if tenantId matches subdomain)
        if (tenantRegistryRepository.existsById(subdomain)) {
            return Optional.of(subdomain);
        }

        // 2b. Check TenantBranding by customSubdomain
        Optional<TenantBranding> brandingOpt = tenantBrandingRepository.findByCustomSubdomainIgnoreCase(subdomain);
        if (brandingOpt.isPresent() && brandingOpt.get().getTenant() != null) {
            return Optional.of(brandingOpt.get().getTenant().getTenantId());
        }

        return Optional.empty();
    }

    /**
     * Validates whether a candidate string is an eligible non-reserved institutional subdomain.
     */
    public boolean isValidSubdomain(String candidate) {
        if (candidate == null || candidate.isBlank()) {
            return false;
        }
        String normalized = candidate.trim().toLowerCase();
        if (RESERVED_SUBDOMAINS.contains(normalized)) {
            return false;
        }
        // Must contain standard alphanumeric / hyphen slug syntax
        return normalized.matches("^[a-z0-9][a-z0-9-]{1,62}$");
    }
}

