package com.erp.multitenancy.service;

import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantLifecycleSchedulerTest {

    @Mock
    private TenantRegistryRepository tenantRegistryRepository;

    @Mock
    private TenantLifecycleService tenantLifecycleService;

    @InjectMocks
    private TenantLifecycleScheduler scheduler;

    private TenantLifecycleService lifecycleServiceDirect;

    @BeforeEach
    void setUp() {
        lifecycleServiceDirect = new TenantLifecycleService(tenantRegistryRepository);
    }

    @Test
    void shouldTriggerTrialExpirationCheckOnScheduledRun() {
        when(tenantLifecycleService.transitionExpiredTrialsToReadOnlyGrace()).thenReturn(3);

        scheduler.scheduleTrialExpirationCheck();

        verify(tenantLifecycleService, times(1)).transitionExpiredTrialsToReadOnlyGrace();
    }

    @Test
    void shouldTransitionExpiredTrialTenantsToReadOnlyGrace() {
        LocalDateTime expiredDate = LocalDateTime.now().minusDays(1);
        TenantRegistry expiredTenant = new TenantRegistry(
                "tenant-expired-1",
                "Expired Academy",
                TenantStatus.TRIAL_ACTIVE,
                "SHARED"
        );
        expiredTenant.setTrialEndDate(expiredDate);

        when(tenantRegistryRepository.findByStatusAndTrialEndDateBefore(eq(TenantStatus.TRIAL_ACTIVE), any(LocalDateTime.class)))
                .thenReturn(List.of(expiredTenant));

        int transitioned = lifecycleServiceDirect.transitionExpiredTrialsToReadOnlyGrace();

        assertEquals(1, transitioned, "One expired tenant should be transitioned");

        ArgumentCaptor<TenantRegistry> captor = ArgumentCaptor.forClass(TenantRegistry.class);
        verify(tenantRegistryRepository, times(1)).save(captor.capture());

        TenantRegistry savedTenant = captor.getValue();
        assertEquals(TenantStatus.READ_ONLY_GRACE, savedTenant.getStatus());
        assertEquals("tenant-expired-1", savedTenant.getTenantId());
    }

    @Test
    void shouldDoNothingWhenNoExpiredTenantsFound() {
        when(tenantRegistryRepository.findByStatusAndTrialEndDateBefore(eq(TenantStatus.TRIAL_ACTIVE), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        int transitioned = lifecycleServiceDirect.transitionExpiredTrialsToReadOnlyGrace();

        assertEquals(0, transitioned);
        verify(tenantRegistryRepository, never()).save(any());
    }
}
