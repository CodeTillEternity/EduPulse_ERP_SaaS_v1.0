package com.erp.multitenancy.controller;

import com.erp.multitenancy.dto.TenantBrandingDTO;
import com.erp.multitenancy.service.TenantBrandingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public REST Controller serving white-label institution branding and visual identity themes
 * prior to user authentication.
 */
@RestController
@RequestMapping({"/api/public/branding", "/api/v1/public/branding"})
@CrossOrigin(origins = "*")
@Tag(name = "Public White-Label Branding", description = "Public endpoints for tenant visual theming and subdomain resolution")
public class PublicBrandingController {

    private final TenantBrandingService brandingService;

    public PublicBrandingController(TenantBrandingService brandingService) {
        this.brandingService = brandingService;
    }

    /**
     * Resolves tenant visual identity (logos, colors, favicon) by custom subdomain.
     *
     * @param subdomain the institutional subdomain (e.g., "dps", "stanford")
     * @return the branding configuration or 404 if not found
     */
    @GetMapping("/{subdomain}")
    @Operation(summary = "Get tenant branding by subdomain", description = "Public endpoint to fetch white-label logos, colors, and metadata prior to login")
    public ResponseEntity<TenantBrandingDTO> getBrandingBySubdomain(@PathVariable("subdomain") String subdomain) {
        return brandingService.getBrandingBySubdomain(subdomain)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
