package com.edupulse.core.domain.billing.repository;

import com.edupulse.core.domain.billing.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("coreBillingSubscriptionPlanRepository")
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    Optional<SubscriptionPlan> findByStripePriceId(String stripePriceId);

    Optional<SubscriptionPlan> findByName(String name);
}
