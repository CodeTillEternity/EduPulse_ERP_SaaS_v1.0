package com.erp.multitenancy.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Data Transfer Object representing white-labeled branding parameters for a tenant.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record TenantBrandingDTO(
        String tenantId,
        String institutionName,
        String customSubdomain,
        String logoUrl,
        String faviconUrl,
        String primaryColorHex,
        String secondaryColorHex
) implements java.io.Serializable {}
