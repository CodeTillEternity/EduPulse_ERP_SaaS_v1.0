package com.erp.subscription.service;

import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.subscription.entity.SubscriptionPlan;
import com.erp.subscription.entity.TenantSubscription;
import com.erp.subscription.repository.SubscriptionPlanRepository;
import com.erp.subscription.repository.TenantSubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Implementation of SubscriptionService handling payment webhook lifecycle transitions.
 */
@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionServiceImpl.class);

    private final TenantRegistryRepository tenantRegistryRepository;
    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    public SubscriptionServiceImpl(TenantRegistryRepository tenantRegistryRepository,
                                   TenantSubscriptionRepository tenantSubscriptionRepository,
                                   SubscriptionPlanRepository subscriptionPlanRepository) {
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
    }

    @Override
    @Transactional
    public TenantSubscription activateSubscription(String tenantId, Long planId, String planName, String billingCycle) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalArgumentException("Tenant ID cannot be null or blank for subscription activation");
        }

        String cycle = (billingCycle != null && !billingCycle.isBlank()) ? billingCycle.toUpperCase() : "MONTHLY";

        // 1. Transition TenantRegistry status from TRIAL_ACTIVE / READ_ONLY_GRACE / SUSPENDED to ACTIVE
        Optional<TenantRegistry> tenantOpt = tenantRegistryRepository.findById(tenantId);
        if (tenantOpt.isPresent()) {
            TenantRegistry tenant = tenantOpt.get();
            TenantStatus previousStatus = tenant.getStatus();

            tenant.setStatus(TenantStatus.ACTIVE);
            tenantRegistryRepository.save(tenant);
            log.info("Tenant [{}] transitioned from {} to ACTIVE status upon successful payment",
                    tenantId, previousStatus);
        } else {
            log.warn("Subscription activation received for uncatalogued tenant [{}]. Proceeding with subscription provisioning", tenantId);
        }

        // 2. Resolve purchased SubscriptionPlan
        SubscriptionPlan targetPlan = null;
        if (planId != null) {
            targetPlan = subscriptionPlanRepository.findById(planId).orElse(null);
        }
        if (targetPlan == null && planName != null && !planName.isBlank()) {
            targetPlan = subscriptionPlanRepository.findByNameIgnoreCase(planName.trim()).orElse(null);
        }
        if (targetPlan == null) {
            targetPlan = subscriptionPlanRepository.findByNameIgnoreCase("Starter")
                    .orElseGet(() -> subscriptionPlanRepository.save(new SubscriptionPlan("Starter", 500, 5120, false)));
        }

        // 3. Calculate new valid_until date based on billing periodicity
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime validUntil = "ANNUAL".equalsIgnoreCase(cycle) || "YEARLY".equalsIgnoreCase(cycle)
                ? now.plusYears(1)
                : now.plusMonths(1);

        // 4. Update or create TenantSubscription record
        Optional<TenantSubscription> existingSubOpt = tenantSubscriptionRepository
                .findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId);

        TenantSubscription subscription;
        if (existingSubOpt.isPresent()) {
            subscription = existingSubOpt.get();
            subscription.setPlan(targetPlan);
            subscription.setBillingCycle(cycle);
            subscription.setValidUntil(validUntil);
            subscription.setIsActive(true);
        } else {
            subscription = new TenantSubscription(tenantId, targetPlan, cycle, validUntil, true);
        }

        TenantSubscription saved = tenantSubscriptionRepository.save(subscription);
        log.info("Activated subscription [{}] on plan '{}' ({}) for tenant [{}], valid until {}",
                saved.getId(), targetPlan.getName(), cycle, tenantId, validUntil);

        return saved;
    }
}
