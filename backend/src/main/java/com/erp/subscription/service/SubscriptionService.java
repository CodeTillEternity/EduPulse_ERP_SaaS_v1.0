package com.erp.subscription.service;

import com.erp.subscription.entity.TenantSubscription;

/**
 * Service managing subscription lifecycle activations and renewals for SaaS tenants.
 */
public interface SubscriptionService {

    /**
     * Activates or updates a tenant's subscription to an ACTIVE state upon payment verification.
     *
     * @param tenantId     the target tenant ID
     * @param planId       the purchased plan ID (optional if planName is present)
     * @param planName     the purchased plan Name (e.g. Starter, Growth, Enterprise)
     * @param billingCycle the billing periodicity (MONTHLY or ANNUAL)
     * @return the updated TenantSubscription
     */
    TenantSubscription activateSubscription(String tenantId, Long planId, String planName, String billingCycle);
}
