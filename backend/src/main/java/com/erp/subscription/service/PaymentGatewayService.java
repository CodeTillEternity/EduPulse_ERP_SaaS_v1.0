package com.erp.subscription.service;

import com.erp.subscription.entity.SubscriptionPlan;

/**
 * Service contract for SaaS subscription payment providers.
 */
public interface PaymentGatewayService {

    /**
     * Creates a checkout session URL for purchasing or upgrading a tenant's subscription plan.
     *
     * @param tenantId     the tenant initiating checkout
     * @param plan         the target subscription plan
     * @param billingCycle billing periodicity (MONTHLY or ANNUAL)
     * @param successUrl   redirect URL on successful checkout
     * @param cancelUrl    redirect URL on cancellation
     * @return the hosted checkout session URL
     */
    String createCheckoutSessionUrl(String tenantId, SubscriptionPlan plan, String billingCycle, String successUrl, String cancelUrl);
}
