package com.erp.subscription.dto;

public record CheckoutSessionRequest(
        String planName,
        Long planId,
        String billingCycle,
        String successUrl,
        String cancelUrl
) {
    public CheckoutSessionRequest(String planName, String billingCycle) {
        this(planName, null, billingCycle, null, null);
    }
}
