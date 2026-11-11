package com.erp.multitenancy.controller;

import com.erp.common.response.ApiResponse;
import com.erp.multitenancy.dto.TenantRegistrationRequest;
import com.erp.multitenancy.dto.TenantRegistrationResponse;
import com.erp.multitenancy.service.TenantProvisioningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public REST Controller managing automated self-service onboarding for new SaaS tenants.
 */
@RestController
@RequestMapping("/api/v1/saas")
@Tag(name = "SaaS Onboarding", description = "Control plane endpoints for tenant registration and provisioning")
public class SaaSOnboardingController {

    private final TenantProvisioningService tenantProvisioningService;

    public SaaSOnboardingController(TenantProvisioningService tenantProvisioningService) {
        this.tenantProvisioningService = tenantProvisioningService;
    }

    /**
     * Public self-service registration and onboarding endpoint for new institutions.
     *
     * @param request the registration request payload
     * @return the created tenant metadata and trial status
     */
    @PostMapping({"/register", "/public/onboard", "/onboard"})
    @Operation(summary = "Register or onboard new tenant", description = "Public self-service endpoint to onboard a new institution with an active 14-day trial")
    public ResponseEntity<ApiResponse<TenantRegistrationResponse>> registerTenant(
            @Valid @RequestBody TenantRegistrationRequest request) {
        TenantRegistrationResponse response = tenantProvisioningService.provisionNewTenant(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.getMessage(), response));
    }
}
