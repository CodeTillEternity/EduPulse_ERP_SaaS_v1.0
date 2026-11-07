package com.edupulse.core.domain.billing.service;

import com.edupulse.core.domain.billing.TenantSubscription;
import com.edupulse.core.domain.billing.repository.SubscriptionPlanRepository;
import com.edupulse.core.domain.billing.repository.TenantSubscriptionRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Subscription;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service orchestrating Razorpay recurring B2B SaaS subscription billing,
 * subscription creation, and tenant subscription tracking.
 */
@Service("coreRazorpayBillingService")
@Slf4j
public class RazorpayBillingService {

    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final RazorpayClient razorpayClient;

    public RazorpayBillingService(TenantSubscriptionRepository tenantSubscriptionRepository,
                                  SubscriptionPlanRepository subscriptionPlanRepository,
                                  RazorpayClient razorpayClient) {
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.razorpayClient = razorpayClient;
    }

    /**
     * Creates a Razorpay Subscription for the specified tenant and plan.
     * Uses the injected RazorpayClient to create a Razorpay Subscription (client.subscriptions.create(request)).
     * Attaches the tenantId in the notes object of the request.
     *
     * @param tenantId Target tenant identifier
     * @param planId   Razorpay Plan identifier (e.g., plan_123456789)
     * @return Generated Razorpay subscription_id
     */
    @Transactional
    public String createSubscription(String tenantId, String planId) {
        log.info("Creating Razorpay subscription for tenantId: [{}], planId: [{}]", tenantId, planId);

        try {
            JSONObject request = new JSONObject();
            request.put("plan_id", planId);
            request.put("total_count", 12);
            request.put("quantity", 1);
            request.put("customer_notify", 1);

            JSONObject notes = new JSONObject();
            notes.put("tenant_id", tenantId);
            request.put("notes", notes);

            Subscription subscription = createRazorpaySubscription(request);
            String subscriptionId = subscription.get("id");

            // Upsert tenant subscription record in the database
            TenantSubscription tenantSub = tenantSubscriptionRepository.findByTenantId(tenantId)
                    .orElseGet(() -> TenantSubscription.builder()
                            .tenantId(tenantId)
                            .build());

            tenantSub.setRazorpaySubscriptionId(subscriptionId);
            tenantSub.setStatus("CREATED");
            if (tenantSub.getCurrentPeriodEnd() == null) {
                tenantSub.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
            }
            tenantSubscriptionRepository.save(tenantSub);

            log.info("Successfully created Razorpay subscription [{}] for tenant [{}]", subscriptionId, tenantId);
            return subscriptionId;
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay subscription for tenant [{}]: {}", tenantId, e.getMessage(), e);
            throw new RuntimeException("Failed to create Razorpay subscription: " + e.getMessage(), e);
        }
    }

    /**
     * Activates or updates a tenant subscription status upon successful payment or charge.
     *
     * @param tenantId       Target tenant identifier
     * @param subscriptionId Razorpay subscription ID
     * @param status         Updated subscription status (e.g. ACTIVE)
     */
    @Transactional
    public void activateSubscription(String tenantId, String subscriptionId, String status) {
        log.info("Activating subscription [tenantId={}, subscriptionId={}, status={}]", tenantId, subscriptionId, status);

        TenantSubscription tenantSub = tenantSubscriptionRepository.findByTenantId(tenantId)
                .orElseGet(() -> TenantSubscription.builder()
                        .tenantId(tenantId)
                        .build());

        if (subscriptionId != null && !subscriptionId.isBlank()) {
            tenantSub.setRazorpaySubscriptionId(subscriptionId);
        }
        tenantSub.setStatus(status != null ? status.toUpperCase() : "ACTIVE");
        tenantSub.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));

        tenantSubscriptionRepository.save(tenantSub);
        log.info("Tenant [{}] subscription marked as {}", tenantId, tenantSub.getStatus());
    }

    /**
     * Invokes Razorpay subscriptions.create via the client.
     * Extracted to permit mock overriding in test environments.
     */
    protected Subscription createRazorpaySubscription(JSONObject request) throws RazorpayException {
        return razorpayClient.subscriptions.create(request);
    }
}
