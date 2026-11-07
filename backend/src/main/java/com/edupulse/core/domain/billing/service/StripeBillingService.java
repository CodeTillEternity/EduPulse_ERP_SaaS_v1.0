package com.edupulse.core.domain.billing.service;

import com.edupulse.core.config.StripeProperties;
import com.edupulse.core.domain.billing.TenantSubscription;
import com.edupulse.core.domain.billing.repository.SubscriptionPlanRepository;
import com.edupulse.core.domain.billing.repository.TenantSubscriptionRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service orchestrating Stripe B2B billing operations, checkout session generation,
 * and tenant subscription provisioning.
 */
@Service("coreStripeBillingService")
@Slf4j
public class StripeBillingService {

    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final StripeProperties stripeProperties;

    public StripeBillingService(TenantSubscriptionRepository tenantSubscriptionRepository,
                                SubscriptionPlanRepository subscriptionPlanRepository,
                                StripeProperties stripeProperties) {
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.stripeProperties = stripeProperties;
    }

    /**
     * Creates a Stripe Checkout Session for the selected pricing plan.
     * Attaches the tenant ID as client_reference_id for idempotent webhook processing.
     *
     * @param tenantId Target tenant identifier
     * @param priceId  Stripe Price object ID
     * @return Hosted Checkout Session URL
     */
    public String createCheckoutSession(String tenantId, String priceId) {
        log.info("Initiating Stripe Checkout Session [tenantId={}, priceId={}]", tenantId, priceId);

        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setClientReferenceId(tenantId)
                .setSuccessUrl(stripeProperties.getSuccessUrl())
                .setCancelUrl(stripeProperties.getCancelUrl())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(priceId)
                                .setQuantity(1L)
                                .build()
                );

        tenantSubscriptionRepository.findByTenantId(tenantId).ifPresent(sub -> {
            if (sub.getStripeCustomerId() != null && !sub.getStripeCustomerId().isBlank()) {
                paramsBuilder.setCustomer(sub.getStripeCustomerId());
            }
        });

        try {
            Session session = createStripeSession(paramsBuilder.build());
            log.info("Generated Stripe Checkout Session [sessionId={}, tenantId={}]", session.getId(), tenantId);
            return session.getUrl();
        } catch (StripeException e) {
            log.error("Failed to generate Stripe checkout session for tenant [{}]: {}", tenantId, e.getMessage(), e);
            throw new RuntimeException("Could not create Stripe checkout session: " + e.getMessage(), e);
        }
    }

    /**
     * Provisions or activates a tenant subscription upon successful checkout completion.
     *
     * @param tenantId             Target tenant identifier
     * @param stripeCustomerId     Assigned Stripe Customer ID
     * @param stripeSubscriptionId Assigned Stripe Subscription ID
     */
    @Transactional
    public void provisionSubscription(String tenantId, String stripeCustomerId, String stripeSubscriptionId) {
        log.info("Provisioning subscription for tenant [tenantId={}, customerId={}, subscriptionId={}]",
                tenantId, stripeCustomerId, stripeSubscriptionId);

        TenantSubscription subscription = tenantSubscriptionRepository.findByTenantId(tenantId)
                .orElseGet(() -> TenantSubscription.builder()
                        .tenantId(tenantId)
                        .build());

        subscription.setStripeCustomerId(stripeCustomerId);
        subscription.setStripeSubscriptionId(stripeSubscriptionId);
        subscription.setStatus("ACTIVE");
        if (subscription.getCurrentPeriodEnd() == null) {
            subscription.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
        }

        tenantSubscriptionRepository.save(subscription);
        log.info("Successfully provisioned and marked subscription ACTIVE for tenant: {}", tenantId);
    }

    /**
     * Updates subscription status and billing period end date from webhook events.
     *
     * @param stripeSubscriptionId Target Stripe subscription ID
     * @param status               Updated lifecycle status
     * @param currentPeriodEnd     Calculated period end timestamp
     */
    @Transactional
    public void updateSubscriptionStatus(String stripeSubscriptionId, String status, LocalDateTime currentPeriodEnd) {
        log.info("Updating subscription status [subscriptionId={}, status={}, periodEnd={}]",
                stripeSubscriptionId, status, currentPeriodEnd);

        tenantSubscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId).ifPresent(sub -> {
            sub.setStatus(status);
            if (currentPeriodEnd != null) {
                sub.setCurrentPeriodEnd(currentPeriodEnd);
            }
            tenantSubscriptionRepository.save(sub);
            log.info("Updated subscription for tenant [{}] to status: {}", sub.getTenantId(), status);
        });
    }

    /**
     * Encapsulates remote call to Stripe API. Can be overridden in test harnesses.
     */
    protected Session createStripeSession(SessionCreateParams params) throws StripeException {
        return Session.create(params);
    }
}
