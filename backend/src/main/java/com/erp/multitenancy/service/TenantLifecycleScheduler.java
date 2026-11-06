package com.erp.multitenancy.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled job executing periodic subscription lifecycle maintenance.
 */
@Component
@EnableScheduling
public class TenantLifecycleScheduler {

    private static final Logger log = LoggerFactory.getLogger(TenantLifecycleScheduler.class);

    private final TenantLifecycleService tenantLifecycleService;

    public TenantLifecycleScheduler(TenantLifecycleService tenantLifecycleService) {
        this.tenantLifecycleService = tenantLifecycleService;
    }

    /**
     * Daily midnight cron job to find expired trial tenants and transition them to READ_ONLY_GRACE.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduleTrialExpirationCheck() {
        log.info("Executing scheduled midnight trial expiration check...");
        int count = tenantLifecycleService.transitionExpiredTrialsToReadOnlyGrace();
        log.info("Finished trial expiration check. {} tenant(s) updated to READ_ONLY_GRACE.", count);

        int suspendedCount = tenantLifecycleService.transitionGracePeriodToSuspended();
        log.info("Finished grace expiration check. {} tenant(s) updated to SUSPENDED.", suspendedCount);
    }
}

