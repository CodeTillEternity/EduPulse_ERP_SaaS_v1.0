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
}
