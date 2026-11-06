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

import java.util.Optional;

/**
 * Service managing plan quotas, resource limits, and feature entitlements for SaaS tenants.
 */
@Service
public class EntitlementService {

    private static final Logger log = LoggerFactory.getLogger(EntitlementService.class);

    public static final int DEFAULT_TRIAL_MAX_STUDENTS = 100;
    public static final int DEFAULT_TRIAL_MAX_STORAGE_MB = 1024;
    public static final boolean DEFAULT_TRIAL_HAS_API_ACCESS = false;

    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final TenantRegistryRepository tenantRegistryRepository;

    public EntitlementService(TenantSubscriptionRepository tenantSubscriptionRepository,
                              SubscriptionPlanRepository subscriptionPlanRepository,
                              TenantRegistryRepository tenantRegistryRepository) {
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.tenantRegistryRepository = tenantRegistryRepository;
    }

    /**
     * Checks whether the specified tenant is entitled to add another student given their current student count.
     *
     * @param tenantId            the tenant identifier
     * @param currentStudentCount current active student count
     * @return true if current count is strictly within the plan's quota; false otherwise
     */
    public boolean canAddStudent(String tenantId, int currentStudentCount) {
        if (tenantId == null || tenantId.isBlank()) {
            return false;
        }

        Optional<TenantRegistry> tenantOpt = tenantRegistryRepository.findById(tenantId);
        if (tenantOpt.isEmpty()) {
            log.warn("Entitlement check failed: Tenant [{}] not found", tenantId);
            return false;
        }

        TenantRegistry tenant = tenantOpt.get();
        TenantStatus status = tenant.getStatus();

        // Lockout / immutable states cannot add students
        if (status == TenantStatus.SUSPENDED ||
            status == TenantStatus.PENDING_DELETION ||
            status == TenantStatus.DELETED ||
            status == TenantStatus.READ_ONLY_GRACE) {
            log.debug("Tenant [{}] with status {} cannot add students", tenantId, status);
            return false;
        }

        // Active subscription check
        Optional<TenantSubscription> subOpt = tenantSubscriptionRepository
                .findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId);

        if (subOpt.isPresent() && subOpt.get().getPlan() != null) {
            int maxAllowed = subOpt.get().getPlan().getMaxStudents();
            boolean allowed = currentStudentCount < maxAllowed;
            log.debug("Quota check for tenant [{}]: current={}, max={}, allowed={}",
                    tenantId, currentStudentCount, maxAllowed, allowed);
            return allowed;
        }

        // Fallback for TRIAL_ACTIVE without explicit subscription row: apply default trial quota
        if (status == TenantStatus.TRIAL_ACTIVE) {
            boolean allowed = currentStudentCount < DEFAULT_TRIAL_MAX_STUDENTS;
            log.debug("Trial quota check for tenant [{}]: current={}, max={}, allowed={}",
                    tenantId, currentStudentCount, DEFAULT_TRIAL_MAX_STUDENTS, allowed);
            return allowed;
        }

        return false;
    }

    /**
     * Checks whether the specified tenant has storage available for the requested/current usage.
     *
     * @param tenantId         the tenant identifier
     * @param currentStorageMb current storage usage in megabytes
     * @return true if current usage is strictly within the plan's quota; false otherwise
     */
    public boolean canUseStorage(String tenantId, long currentStorageMb) {
        if (tenantId == null || tenantId.isBlank()) {
            return false;
        }

        Optional<TenantRegistry> tenantOpt = tenantRegistryRepository.findById(tenantId);
        if (tenantOpt.isEmpty()) {
            return false;
        }

        TenantRegistry tenant = tenantOpt.get();
        TenantStatus status = tenant.getStatus();

        if (status == TenantStatus.SUSPENDED ||
            status == TenantStatus.PENDING_DELETION ||
            status == TenantStatus.DELETED ||
            status == TenantStatus.READ_ONLY_GRACE) {
            return false;
        }

        Optional<TenantSubscription> subOpt = tenantSubscriptionRepository
                .findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId);

        if (subOpt.isPresent() && subOpt.get().getPlan() != null) {
            return currentStorageMb < subOpt.get().getPlan().getMaxStorageMb();
        }

        if (status == TenantStatus.TRIAL_ACTIVE) {
            return currentStorageMb < DEFAULT_TRIAL_MAX_STORAGE_MB;
        }

        return false;
    }

    /**
     * Checks whether the tenant's plan entitles them to external API access.
     *
     * @param tenantId the tenant identifier
     * @return true if plan includes API access; false otherwise
     */
    public boolean hasApiAccess(String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            return false;
        }

        Optional<TenantSubscription> subOpt = tenantSubscriptionRepository
                .findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId);

        if (subOpt.isPresent() && subOpt.get().getPlan() != null) {
            return Boolean.TRUE.equals(subOpt.get().getPlan().getHasApiAccess());
        }

        return DEFAULT_TRIAL_HAS_API_ACCESS;
    }

    /**
     * Resolves the current active SubscriptionPlan for the given tenant.
     *
     * @param tenantId the tenant identifier
     * @return active SubscriptionPlan, if found
     */
    public Optional<SubscriptionPlan> getActivePlan(String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            return Optional.empty();
        }

        return tenantSubscriptionRepository
                .findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId)
                .map(TenantSubscription::getPlan)
                .or(() -> subscriptionPlanRepository.findByNameIgnoreCase("Trial"));
    }
}
