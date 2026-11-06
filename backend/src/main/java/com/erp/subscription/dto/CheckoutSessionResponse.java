package com.erp.subscription.dto;

public record CheckoutSessionResponse(
        String checkoutUrl,
        String planName,
        String billingCycle,
        String tenantId
) {}
