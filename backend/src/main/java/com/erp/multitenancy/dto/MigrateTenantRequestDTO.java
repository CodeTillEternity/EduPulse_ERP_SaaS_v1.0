package com.erp.multitenancy.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for migrating a tenant to dedicated database infrastructure")
public record MigrateTenantRequestDTO(
        @Schema(description = "Target dedicated database routing key (e.g. dedicated-vip-1)", example = "dedicated-vip-1")
        String targetRoutingKey
) {}

