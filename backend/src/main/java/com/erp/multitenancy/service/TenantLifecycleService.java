package com.erp.multitenancy.service;

import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service managing subscription lifecycle state transitions for SaaS tenants.
 */
@Service
public class TenantLifecycleService {

    private static final Logger log = LoggerFactory.getLogger(TenantLifecycleService.class);

    private final TenantRegistryRepository tenantRegistryRepository;

    public TenantLifecycleService(TenantRegistryRepository tenantRegistryRepository) {
        this.tenantRegistryRepository = tenantRegistryRepository;
    }

    /**
     * Finds all tenants where status is TRIAL_ACTIVE and trialEndDate is in the past,
     * and transitions their status to READ_ONLY_GRACE.
     *
     * @return the number of transitioned tenants
     */
    @Transactional
    public int transitionExpiredTrialsToReadOnlyGrace() {
        LocalDateTime now = LocalDateTime.now();
        List<TenantRegistry> expiredTenants = tenantRegistryRepository
                .findByStatusAndTrialEndDateBefore(TenantStatus.TRIAL_ACTIVE, now);

        if (expiredTenants.isEmpty()) {
            log.debug("No expired TRIAL_ACTIVE tenants found at {}", now);
            return 0;
        }

        for (TenantRegistry tenant : expiredTenants) {
            tenant.setStatus(TenantStatus.READ_ONLY_GRACE);
            tenantRegistryRepository.save(tenant);
            log.info("Transitioned tenant [{}] ('{}') from TRIAL_ACTIVE to READ_ONLY_GRACE (trial expired on {})",
                    tenant.getTenantId(), tenant.getInstitutionName(), tenant.getTrialEndDate());
        }

        return expiredTenants.size();
    }

    /**
     * Finds all tenants where status is READ_ONLY_GRACE and 30 days have passed
     * since the trial ended, and transitions their status to SUSPENDED.
     *
     * @return the number of transitioned tenants
     */
    @Transactional
    public int transitionGracePeriodToSuspended() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        List<TenantRegistry> graceTenants = tenantRegistryRepository
                .findByStatusAndTrialEndDateBefore(TenantStatus.READ_ONLY_GRACE, cutoff);

        if (graceTenants.isEmpty()) {
            log.debug("No expired READ_ONLY_GRACE tenants found exceeding 30 days at {}", cutoff);
            return 0;
        }

        for (TenantRegistry tenant : graceTenants) {
            tenant.setStatus(TenantStatus.SUSPENDED);
            tenantRegistryRepository.save(tenant);
            log.info("Transitioned tenant [{}] ('{}') from READ_ONLY_GRACE to SUSPENDED (trial ended on {}, 30 days grace expired)",
                    tenant.getTenantId(), tenant.getInstitutionName(), tenant.getTrialEndDate());
        }

        return graceTenants.size();
    }

    /**
     * Finds all tenants where status is SUSPENDED and 30 additional days have passed
     * since suspension (60 days total since trial ended), and transitions their status
     * to PENDING_DELETION.
     *
     * @return the number of transitioned tenants
     */
    @Transactional
    public int transitionSuspendedToPendingDeletion() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(60);
        List<TenantRegistry> suspendedTenants = tenantRegistryRepository
                .findByStatusAndTrialEndDateBefore(TenantStatus.SUSPENDED, cutoff);

        if (suspendedTenants.isEmpty()) {
            log.debug("No SUSPENDED tenants found exceeding 30 additional days at {}", cutoff);
            return 0;
        }

        for (TenantRegistry tenant : suspendedTenants) {
            tenant.setStatus(TenantStatus.PENDING_DELETION);
            tenantRegistryRepository.save(tenant);
            log.info("Transitioned tenant [{}] ('{}') from SUSPENDED to PENDING_DELETION (trial ended on {}, 60 days total elapsed)",
                    tenant.getTenantId(), tenant.getInstitutionName(), tenant.getTrialEndDate());
        }

        return suspendedTenants.size();
    }
}

