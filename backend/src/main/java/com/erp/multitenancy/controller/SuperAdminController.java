package com.erp.multitenancy.controller;

import com.erp.common.response.ApiResponse;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.multitenancy.service.TenantDatabaseUpgradeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Super Admin controller providing platform-wide control plane management for SaaS tenants.
 */
@RestController
@RequestMapping("/api/v1/saas/admin")
@Tag(name = "SaaS Super Admin", description = "Platform control plane endpoints for Super Admin governance")
public class SuperAdminController {

    private final TenantRegistryRepository tenantRegistryRepository;
    private final TenantDatabaseUpgradeService tenantDatabaseUpgradeService;

    public SuperAdminController(
            TenantRegistryRepository tenantRegistryRepository,
            TenantDatabaseUpgradeService tenantDatabaseUpgradeService) {
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.tenantDatabaseUpgradeService = tenantDatabaseUpgradeService;
    }

    /**
     * Lists all registered SaaS tenants across the platform.
     *
     * @return list of all TenantRegistry entities
     */
    @GetMapping("/tenants")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get all registered tenants", description = "Retrieves all SaaS tenant partitions, database modes, and lifecycle states")
    public ResponseEntity<ApiResponse<List<TenantRegistry>>> getAllTenants() {
        List<TenantRegistry> tenants = tenantRegistryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Tenants retrieved successfully", tenants));
    }

    /**
     * Upgrades a tenant's database mode to DEDICATED and hot-loads their dedicated DataSource.
     *
     * @param tenantId Tenant identifier
     * @return Updated TenantRegistry record
     */
    @PostMapping("/tenants/{tenantId}/upgrade-database")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Upgrade tenant database mode to DEDICATED", description = "Transitions tenant to dedicated database and hot-loads DataSource")
    public ResponseEntity<ApiResponse<TenantRegistry>> upgradeTenantDatabase(@PathVariable("tenantId") String tenantId) {
        TenantRegistry updatedTenant = tenantDatabaseUpgradeService.upgradeToDedicatedDatabase(tenantId);
        return ResponseEntity.ok(ApiResponse.success("Tenant upgraded to dedicated database successfully", updatedTenant));
    }
}
