package com.edupulse.core.domain.billing.repository;

import com.edupulse.core.domain.billing.TenantSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("coreBillingTenantSubscriptionRepository")
public interface TenantSubscriptionRepository extends JpaRepository<TenantSubscription, Long> {

    Optional<TenantSubscription> findByTenantId(String tenantId);

    Optional<TenantSubscription> findByStripeCustomerId(String stripeCustomerId);

    Optional<TenantSubscription> findByStripeSubscriptionId(String stripeSubscriptionId);
}
