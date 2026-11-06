package com.erp.subscription.service;

import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.subscription.entity.SubscriptionPlan;
import com.erp.subscription.entity.TenantSubscription;
import com.erp.subscription.repository.SubscriptionPlanRepository;
import com.erp.subscription.repository.TenantSubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EntitlementServiceTest {

    @Mock
    private TenantSubscriptionRepository tenantSubscriptionRepository;

    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Mock
    private TenantRegistryRepository tenantRegistryRepository;

    @InjectMocks
    private EntitlementService entitlementService;

    private SubscriptionPlan trialPlan;
    private SubscriptionPlan starterPlan;
    private SubscriptionPlan growthPlan;

    @BeforeEach
    void setUp() {
        trialPlan = new SubscriptionPlan("Trial", 100, 1024, false);
        trialPlan.setId(1L);

        starterPlan = new SubscriptionPlan("Starter", 500, 5120, false);
        starterPlan.setId(2L);

        growthPlan = new SubscriptionPlan("Growth", 2500, 25600, true);
        growthPlan.setId(3L);
    }

    @Test
    void shouldAllowStudentAdditionWhenWithinTrialQuota() {
        String tenantId = "tenant-trial-1";
        TenantRegistry tenant = new TenantRegistry(tenantId, "Trial School", TenantStatus.TRIAL_ACTIVE, "SHARED");
        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

        TenantSubscription subscription = new TenantSubscription(tenantId, trialPlan, "TRIAL", LocalDateTime.now().plusDays(10), true);
        when(tenantSubscriptionRepository.findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId))
                .thenReturn(Optional.of(subscription));

        assertTrue(entitlementService.canAddStudent(tenantId, 50), "50 students is within 100 trial quota");
        assertFalse(entitlementService.canAddStudent(tenantId, 100), "100 students meets or exceeds 100 trial quota");
    }

    @Test
    void shouldFallbackToDefaultTrialQuotaWhenNoSubscriptionRecordExists() {
        String tenantId = "tenant-trial-nosub";
        TenantRegistry tenant = new TenantRegistry(tenantId, "Trial School 2", TenantStatus.TRIAL_ACTIVE, "SHARED");
        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(tenantSubscriptionRepository.findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId))
                .thenReturn(Optional.empty());

        assertTrue(entitlementService.canAddStudent(tenantId, 99));
        assertFalse(entitlementService.canAddStudent(tenantId, 100));
    }

    @Test
    void shouldEnforcePaidPlanStudentQuota() {
        String tenantId = "tenant-paid-1";
        TenantRegistry tenant = new TenantRegistry(tenantId, "Paid Academy", TenantStatus.ACTIVE, "SHARED");
        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

        TenantSubscription subscription = new TenantSubscription(tenantId, starterPlan, "MONTHLY", LocalDateTime.now().plusMonths(1), true);
        when(tenantSubscriptionRepository.findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId))
                .thenReturn(Optional.of(subscription));

        assertTrue(entitlementService.canAddStudent(tenantId, 499), "499 is within 500 starter quota");
        assertFalse(entitlementService.canAddStudent(tenantId, 500), "500 equals starter quota cap");
        assertFalse(entitlementService.canAddStudent(tenantId, 501), "501 exceeds starter quota cap");
    }

    @Test
    void shouldBlockStudentAdditionForRestrictedTenantStatuses() {
        String tenantId = "tenant-locked-1";
        TenantRegistry suspendedTenant = new TenantRegistry(tenantId, "Suspended Academy", TenantStatus.SUSPENDED, "SHARED");
        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(suspendedTenant));

        assertFalse(entitlementService.canAddStudent(tenantId, 10), "Suspended tenants cannot add students");

        TenantRegistry graceTenant = new TenantRegistry(tenantId, "Grace Academy", TenantStatus.READ_ONLY_GRACE, "SHARED");
        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(graceTenant));

        assertFalse(entitlementService.canAddStudent(tenantId, 10), "READ_ONLY_GRACE tenants cannot add students");

        TenantRegistry pendingDeletionTenant = new TenantRegistry(tenantId, "Pending Deletion Academy", TenantStatus.PENDING_DELETION, "SHARED");
        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(pendingDeletionTenant));

        assertFalse(entitlementService.canAddStudent(tenantId, 10), "PENDING_DELETION tenants cannot add students");
    }

    @Test
    void shouldCheckStorageQuota() {
        String tenantId = "tenant-storage-1";
        TenantRegistry tenant = new TenantRegistry(tenantId, "Storage Tech", TenantStatus.ACTIVE, "SHARED");
        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

        TenantSubscription subscription = new TenantSubscription(tenantId, starterPlan, "MONTHLY", LocalDateTime.now().plusMonths(1), true);
        when(tenantSubscriptionRepository.findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId))
                .thenReturn(Optional.of(subscription));

        assertTrue(entitlementService.canUseStorage(tenantId, 4000L), "4000MB is within 5120MB starter quota");
        assertFalse(entitlementService.canUseStorage(tenantId, 5120L), "5120MB is at maximum quota");
    }

    @Test
    void shouldCheckApiAccessEntitlement() {
        String tenantStarter = "tenant-starter";
        TenantSubscription subStarter = new TenantSubscription(tenantStarter, starterPlan, "MONTHLY", LocalDateTime.now().plusMonths(1), true);
        when(tenantSubscriptionRepository.findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantStarter))
                .thenReturn(Optional.of(subStarter));

        assertFalse(entitlementService.hasApiAccess(tenantStarter), "Starter plan does not have API access");

        String tenantGrowth = "tenant-growth";
        TenantSubscription subGrowth = new TenantSubscription(tenantGrowth, growthPlan, "MONTHLY", LocalDateTime.now().plusMonths(1), true);
        when(tenantSubscriptionRepository.findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantGrowth))
                .thenReturn(Optional.of(subGrowth));

        assertTrue(entitlementService.hasApiAccess(tenantGrowth), "Growth plan has API access");
    }

    @Test
    void shouldReturnActivePlanForTenant() {
        String tenantId = "tenant-plan-1";
        TenantSubscription subscription = new TenantSubscription(tenantId, growthPlan, "MONTHLY", LocalDateTime.now().plusMonths(1), true);
        when(tenantSubscriptionRepository.findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId))
                .thenReturn(Optional.of(subscription));

        Optional<SubscriptionPlan> activePlan = entitlementService.getActivePlan(tenantId);

        assertTrue(activePlan.isPresent());
        assertEquals("Growth", activePlan.get().getName());
        assertTrue(activePlan.get().getHasApiAccess());
    }
}
