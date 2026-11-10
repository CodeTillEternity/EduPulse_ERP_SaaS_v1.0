package com.erp.subscription.controller;

import com.erp.common.response.ApiResponse;
import com.erp.multitenancy.TenantContext;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.subscription.dto.CheckoutSessionRequest;
import com.erp.subscription.dto.CheckoutSessionResponse;
import com.erp.subscription.entity.SubscriptionPlan;
import com.erp.subscription.repository.SubscriptionPlanRepository;
import com.erp.subscription.service.PaymentGatewayService;
import com.erp.subscription.service.SaaSBillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Controller exposing billing checkout operations for tenant plan upgrades.
 */
@RestController
@RequestMapping("/api/v1/saas/billing")
@Tag(name = "SaaS Billing", description = "Tenant subscription billing and checkout management")
public class SubscriptionController {

    private final PaymentGatewayService paymentGatewayService;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final TenantRegistryRepository tenantRegistryRepository;
    private final SaaSBillingService saaSBillingService;

    public SubscriptionController(PaymentGatewayService paymentGatewayService,
                                  SubscriptionPlanRepository subscriptionPlanRepository) {
        this(paymentGatewayService, subscriptionPlanRepository, null, null);
    }

    @Autowired
    public SubscriptionController(PaymentGatewayService paymentGatewayService,
                                  SubscriptionPlanRepository subscriptionPlanRepository,
                                  @Autowired(required = false) TenantRegistryRepository tenantRegistryRepository,
                                  @Autowired(required = false) SaaSBillingService saaSBillingService) {
        this.paymentGatewayService = paymentGatewayService;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.saaSBillingService = saaSBillingService;
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

    /**
     * Retrieves current tenant's active SaaS plan, trial days remaining, and upcoming invoice dates.
     */
    @GetMapping("/subscription")
    @Operation(summary = "Get current tenant subscription details", description = "Returns active plan, trial days remaining, and upcoming invoice dates")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSubscriptionDetails() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank() || "default".equalsIgnoreCase(tenantId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Active tenant session context is required"));
        }

        TenantRegistry tenant = tenantRegistryRepository != null
                ? tenantRegistryRepository.findById(tenantId).orElse(null)
                : null;

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("tenantId", tenantId);

        if (tenant != null) {
            data.put("institutionName", tenant.getInstitutionName());
            data.put("subdomain", tenant.getSubdomain());
            data.put("subscriptionTier", tenant.getSubscriptionTier() != null ? tenant.getSubscriptionTier() : "TRIAL");
            data.put("accountStatus", tenant.getAccountStatus() != null ? tenant.getAccountStatus().name() : "TRIAL");
            data.put("trialEndDate", tenant.getTrialEndDate());
            data.put("currentPeriodEnd", tenant.getCurrentPeriodEnd());
            data.put("stripeCustomerId", tenant.getStripeCustomerId());
            data.put("stripeSubscriptionId", tenant.getStripeSubscriptionId());

            long daysRemaining = 0;
            if (tenant.getTrialEndDate() != null) {
                daysRemaining = Math.max(0, ChronoUnit.DAYS.between(LocalDateTime.now(), tenant.getTrialEndDate()));
            }
            data.put("trialDaysRemaining", daysRemaining);
            data.put("upcomingInvoiceDate", tenant.getCurrentPeriodEnd() != null ? tenant.getCurrentPeriodEnd() : tenant.getTrialEndDate());
        } else {
            data.put("institutionName", "Institutional Portal");
            data.put("subscriptionTier", "TRIAL");
            data.put("accountStatus", "TRIAL");
            data.put("trialDaysRemaining", 14);
            data.put("upcomingInvoiceDate", LocalDateTime.now().plusDays(14));
        }

        return ResponseEntity.ok(ApiResponse.success("Subscription details retrieved successfully", data));
    }

    /**
     * Initializes a Stripe Checkout session redirect URL to upgrade tenant to PRO or ENTERPRISE.
     */
    @PostMapping("/stripe-checkout")
    @Operation(summary = "Create Stripe Checkout session", description = "Generates a Stripe Checkout Session for subscription upgrade (PRO / ENTERPRISE)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createStripeCheckout(
            @RequestBody(required = false) Map<String, String> request) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank() || "default".equalsIgnoreCase(tenantId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Active tenant session context is required"));
        }

        Map<String, String> body = request != null ? request : Map.of();
        String tier = body.getOrDefault("tier", "PRO");
        String successUrl = body.getOrDefault("successUrl", "/billing/success");
        String cancelUrl = body.getOrDefault("cancelUrl", "/billing/cancel");

        if (saaSBillingService == null) {
            return ResponseEntity.ok(ApiResponse.success("Mock checkout URL", Map.of(
                    "checkoutUrl", successUrl + "?session_id=mock_cs_" + UUID.randomUUID().toString().substring(0, 8) + "&tier=" + tier,
                    "tier", tier
            )));
        }

        String checkoutUrl = saaSBillingService.createCheckoutSession(tenantId, tier, successUrl, cancelUrl);
        return ResponseEntity.ok(ApiResponse.success("Stripe checkout session initialized", Map.of(
                "checkoutUrl", checkoutUrl,
                "tier", tier
        )));
    }
}
