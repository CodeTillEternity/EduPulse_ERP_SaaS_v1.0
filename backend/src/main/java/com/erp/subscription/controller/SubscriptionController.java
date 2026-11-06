package com.erp.subscription.controller;

import com.erp.common.response.ApiResponse;
import com.erp.multitenancy.TenantContext;
import com.erp.subscription.dto.CheckoutSessionRequest;
import com.erp.subscription.dto.CheckoutSessionResponse;
import com.erp.subscription.entity.SubscriptionPlan;
import com.erp.subscription.repository.SubscriptionPlanRepository;
import com.erp.subscription.service.PaymentGatewayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller exposing billing checkout operations for tenant plan upgrades.
 */
@RestController
@RequestMapping("/api/v1/saas/billing")
@Tag(name = "SaaS Billing", description = "Tenant subscription billing and checkout management")
public class SubscriptionController {

    private final PaymentGatewayService paymentGatewayService;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    public SubscriptionController(PaymentGatewayService paymentGatewayService,
                                  SubscriptionPlanRepository subscriptionPlanRepository) {
        this.paymentGatewayService = paymentGatewayService;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
    }

    /**
     * Creates a checkout session URL for purchasing or upgrading a plan.
     *
     * @param request the checkout request details
     * @return checkout URL and plan metadata
     */
    @PostMapping("/checkout")
    @Operation(summary = "Create checkout session", description = "Generates a Stripe Checkout Session URL for subscription upgrade")
    public ResponseEntity<ApiResponse<CheckoutSessionResponse>> createCheckoutSession(
            @Valid @RequestBody CheckoutSessionRequest request) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank() || "default".equalsIgnoreCase(tenantId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Active tenant session context is required for billing checkout"));
        }

        SubscriptionPlan plan = null;
        if (request.planId() != null) {
            plan = subscriptionPlanRepository.findById(request.planId()).orElse(null);
        }
        if (plan == null && request.planName() != null && !request.planName().isBlank()) {
            plan = subscriptionPlanRepository.findByNameIgnoreCase(request.planName().trim()).orElse(null);
        }
        if (plan == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Requested subscription plan could not be found"));
        }

        String billingCycle = (request.billingCycle() != null && !request.billingCycle().isBlank())
                ? request.billingCycle().toUpperCase()
                : "MONTHLY";

        String checkoutUrl = paymentGatewayService.createCheckoutSessionUrl(
                tenantId,
                plan,
                billingCycle,
                request.successUrl(),
                request.cancelUrl()
        );

        CheckoutSessionResponse response = new CheckoutSessionResponse(
                checkoutUrl,
                plan.getName(),
                billingCycle,
                tenantId
        );

        return ResponseEntity.ok(ApiResponse.success("Checkout session created successfully", response));
    }
}
