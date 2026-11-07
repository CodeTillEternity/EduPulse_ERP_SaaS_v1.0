package com.erp.subscription.service;

import com.erp.subscription.entity.SubscriptionPlan;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Razorpay implementation of PaymentGatewayService for SaaS tenant subscriptions.
 */
@Service
public class RazorpayPaymentServiceImpl implements PaymentGatewayService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayPaymentServiceImpl.class);

    @Override
    public String createCheckoutSessionUrl(String tenantId,
                                           SubscriptionPlan plan,
                                           String billingCycle,
                                           String successUrl,
                                           String cancelUrl) {
        log.info("Generating Razorpay subscription session token for tenant [{}] on plan [{}]", tenantId, plan.getName());
        return "https://checkout.razorpay.com/v1/checkout.js?subscription_id=sub_rzp_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
    }
}
