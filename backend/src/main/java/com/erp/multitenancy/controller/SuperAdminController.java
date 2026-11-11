package com.erp.multitenancy.controller;

import com.erp.common.response.ApiResponse;
import com.erp.multitenancy.dto.MigrateTenantRequestDTO;
import com.erp.multitenancy.dto.ProvisionInstitutionRequestDTO;
import com.erp.multitenancy.dto.TenantMigrationResultDTO;
import com.erp.multitenancy.dto.UpdateTenantStatusDTO;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.multitenancy.service.TenantDatabaseUpgradeService;
import com.erp.multitenancy.service.TenantMigrationService;
import com.erp.multitenancy.service.TenantProvisioningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Super Admin controller providing platform-wide control plane management for SaaS tenants.
 */
@RestController
@RequestMapping({"/api/v1/saas/admin", "/api/saas/admin"})
@Tag(name = "SaaS Super Admin", description = "Platform control plane endpoints for Super Admin governance")
public class SuperAdminController {

    private final TenantRegistryRepository tenantRegistryRepository;
    private final TenantDatabaseUpgradeService tenantDatabaseUpgradeService;
    private final TenantProvisioningService tenantProvisioningService;
    private final TenantMigrationService tenantMigrationService;

    public SuperAdminController(
            TenantRegistryRepository tenantRegistryRepository,
            TenantDatabaseUpgradeService tenantDatabaseUpgradeService,
            TenantProvisioningService tenantProvisioningService,
            TenantMigrationService tenantMigrationService) {
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.tenantDatabaseUpgradeService = tenantDatabaseUpgradeService;
        this.tenantProvisioningService = tenantProvisioningService;
        this.tenantMigrationService = tenantMigrationService;
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
     * Provisions a new institution partition from the Central SaaS Control Plane.
     */
    @PostMapping("/tenants/provision")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Provision a new institution", description = "Creates registry entry, 14-day trial, tenant namespace, and initial SUPERADMIN user")
    public ResponseEntity<ApiResponse<TenantRegistry>> provisionInstitution(
            @Valid @RequestBody ProvisionInstitutionRequestDTO request) {
        TenantRegistry created = tenantProvisioningService.provisionNewInstitution(
                request.name(),
                request.email(),
                request.password(),
                request.fullName()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Institution provisioned successfully", created));
    }

    /**
     * Instantly transitions a tenant's accountStatus (e.g. SUSPENDED or ACTIVE).
     */
    @RequestMapping(value = "/tenants/{tenantId}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Transition tenant account status", description = "Instantly updates tenant accountStatus to ACTIVE, TRIAL, or SUSPENDED")
    public ResponseEntity<ApiResponse<TenantRegistry>> updateTenantStatus(
            @PathVariable("tenantId") String tenantId,
            @Valid @RequestBody UpdateTenantStatusDTO request) {
        TenantRegistry updated = tenantProvisioningService.updateTenantStatus(tenantId, request.accountStatus());
        return ResponseEntity.ok(ApiResponse.success("Tenant status updated to " + request.accountStatus(), updated));
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

    /**
     * Executes automated migration of a tenant from shared pool to dedicated infrastructure.
     * Halts writes, executes Flyway migrations, securely copies tenant rows, updates routing key, and restores status.
     *
     * @param tenantId Target tenant identifier
     * @param request  Optional migration request containing target routing key
     * @return Migration execution summary
     */
    @PostMapping("/tenants/{tenantId}/migrate")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Migrate tenant to dedicated database", description = "Safely halts writes, runs Flyway migrations, copies tenant data, and updates routing key to dedicated pool")
    public ResponseEntity<ApiResponse<TenantMigrationResultDTO>> migrateTenantToDedicated(
            @PathVariable("tenantId") String tenantId,
            @RequestBody(required = false) MigrateTenantRequestDTO request) {
        String targetRoutingKey = (request != null && request.targetRoutingKey() != null && !request.targetRoutingKey().isBlank())
                ? request.targetRoutingKey()
                : "dedicated-vip-1";
        TenantMigrationResultDTO result = tenantMigrationService.migrateTenantToDedicated(tenantId, targetRoutingKey);
        return ResponseEntity.ok(ApiResponse.success("Tenant successfully migrated to dedicated database", result));
    }
}
