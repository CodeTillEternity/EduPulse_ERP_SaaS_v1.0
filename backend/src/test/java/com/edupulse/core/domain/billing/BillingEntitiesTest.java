package com.edupulse.core.domain.billing;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class BillingEntitiesTest {

    @Test
    @DisplayName("SubscriptionPlan should hold price and student capacity correctly")
    void subscriptionPlan_instantiatesCorrectly() {
        SubscriptionPlan plan = SubscriptionPlan.builder()
                .id(1L)
                .name("Growth Enterprise")
                .stripePriceId("price_growth_123")
                .maxStudents(5000)
                .build();

        assertThat(plan.getId()).isEqualTo(1L);
        assertThat(plan.getName()).isEqualTo("Growth Enterprise");
        assertThat(plan.getStripePriceId()).isEqualTo("price_growth_123");
        assertThat(plan.getMaxStudents()).isEqualTo(5000);
    }

    @Test
    @DisplayName("TenantSubscription should link to plan and track status and stripe credentials")
    void tenantSubscription_linksToPlanAndHoldsStripeDetails() {
        SubscriptionPlan plan = new SubscriptionPlan(2L, "Starter", "price_starter_456", 500);
        LocalDateTime periodEnd = LocalDateTime.now().plusMonths(1);

        TenantSubscription subscription = TenantSubscription.builder()
                .id(10L)
                .tenantId("tenant-cambridge")
                .stripeCustomerId("cus_cambridge_123")
                .stripeSubscriptionId("sub_cambridge_456")
                .status("ACTIVE")
                .currentPeriodEnd(periodEnd)
                .plan(plan)
                .build();

        assertThat(subscription.getTenantId()).isEqualTo("tenant-cambridge");
        assertThat(subscription.getStripeCustomerId()).isEqualTo("cus_cambridge_123");
        assertThat(subscription.getStripeSubscriptionId()).isEqualTo("sub_cambridge_456");
        assertThat(subscription.getStatus()).isEqualTo("ACTIVE");
        assertThat(subscription.getCurrentPeriodEnd()).isEqualTo(periodEnd);
        assertThat(subscription.getPlan()).isEqualTo(plan);
    }
}
