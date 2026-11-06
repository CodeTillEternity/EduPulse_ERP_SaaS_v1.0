package com.erp.multitenancy.service;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.multitenancy.dto.TenantRegistrationRequest;
import com.erp.multitenancy.dto.TenantRegistrationResponse;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantProvisioningServiceTest {

    @Mock
    private TenantRegistryRepository tenantRegistryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Mock
    private TenantSubscriptionRepository tenantSubscriptionRepository;

    @InjectMocks
    private TenantProvisioningService provisioningService;

    private TenantRegistrationRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new TenantRegistrationRequest(
                "Apex Global University",
                "admin@apex.edu",
                "Dean Winchester",
                "Secure@123"
        );
    }

    @Test
    void shouldProvisionNewTenantSuccessfullyWith14DayTrial() {
        when(tenantRegistryRepository.findByInstitutionNameIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(tenantRegistryRepository.findByAdminEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");

        SubscriptionPlan trialPlan = new SubscriptionPlan("Trial", 100, 1024, false);
        when(subscriptionPlanRepository.findByNameIgnoreCase("Trial")).thenReturn(Optional.of(trialPlan));

        when(tenantRegistryRepository.save(any(TenantRegistry.class))).thenAnswer(invocation -> {
            TenantRegistry input = invocation.getArgument(0);
            return input;
        });

        LocalDateTime beforeTest = LocalDateTime.now();
        TenantRegistrationResponse response = provisioningService.provisionNewTenant(validRequest);
        LocalDateTime afterTest = LocalDateTime.now();

        assertNotNull(response);
        assertNotNull(response.getTenantId());
        assertTrue(response.getTenantId().startsWith("apex-global-university-"));
        assertEquals(TenantStatus.TRIAL_ACTIVE, response.getStatus());
        assertEquals("Apex Global University", response.getInstitutionName());
        assertEquals("admin@apex.edu", response.getAdminEmail());

        // Verify 14-day trial window calculation
        assertNotNull(response.getTrialEndDate());
        long daysDiff = ChronoUnit.DAYS.between(beforeTest, response.getTrialEndDate());
        assertEquals(14, daysDiff, "Trial end date must be exactly 14 days from registration");

        // Verify initial AppUser was created with INSTITUTION_ADMIN role
        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository, times(1)).save(userCaptor.capture());
        AppUser savedUser = userCaptor.getValue();
        assertEquals("admin@apex.edu", savedUser.getEmail());
        assertEquals("admin@apex.edu", savedUser.getUsername());
        assertEquals(Role.INSTITUTION_ADMIN, savedUser.getRole());
        assertEquals("hashed_password", savedUser.getPassword());
        assertEquals(response.getTenantId(), savedUser.getTenantId());
        assertTrue(savedUser.isEnabled());

        // Verify baseline subscription was provisioned
        ArgumentCaptor<TenantSubscription> subCaptor = ArgumentCaptor.forClass(TenantSubscription.class);
        verify(tenantSubscriptionRepository, times(1)).save(subCaptor.capture());
        TenantSubscription savedSub = subCaptor.getValue();
        assertEquals(response.getTenantId(), savedSub.getTenantId());
        assertEquals("Trial", savedSub.getPlan().getName());
        assertTrue(savedSub.getIsActive());
    }

    @Test
    void shouldReturnExistingTenantWhenInstitutionNameAlreadyExists_Idempotency() {
        TenantRegistry existingTenant = new TenantRegistry(
                "apex-existing-1234",
                "Apex Global University",
                TenantStatus.TRIAL_ACTIVE,
                "SHARED"
        );
        existingTenant.setAdminEmail("admin@apex.edu");
        existingTenant.setTrialEndDate(LocalDateTime.now().plusDays(10));

        when(tenantRegistryRepository.findByInstitutionNameIgnoreCase("Apex Global University"))
                .thenReturn(Optional.of(existingTenant));

        TenantRegistrationResponse response = provisioningService.provisionNewTenant(validRequest);

        assertNotNull(response);
        assertEquals("apex-existing-1234", response.getTenantId());
        assertEquals(TenantStatus.TRIAL_ACTIVE, response.getStatus());
        assertEquals("Tenant already registered", response.getMessage());

        // Verify no duplicate user or tenant was saved
        verify(userRepository, never()).save(any(AppUser.class));
        verify(tenantRegistryRepository, never()).save(any(TenantRegistry.class));
    }

    @Test
    void shouldReturnExistingTenantWhenAdminEmailAlreadyExists_Idempotency() {
        when(tenantRegistryRepository.findByInstitutionNameIgnoreCase("Apex Global University"))
                .thenReturn(Optional.empty());

        TenantRegistry existingTenant = new TenantRegistry(
                "apex-email-existing-99",
                "Different Institution Name",
                TenantStatus.ACTIVE,
                "SHARED"
        );
        existingTenant.setAdminEmail("admin@apex.edu");
        existingTenant.setTrialEndDate(LocalDateTime.now().plusDays(5));

        when(tenantRegistryRepository.findByAdminEmailIgnoreCase("admin@apex.edu"))
                .thenReturn(Optional.of(existingTenant));

        TenantRegistrationResponse response = provisioningService.provisionNewTenant(validRequest);

        assertNotNull(response);
        assertEquals("apex-email-existing-99", response.getTenantId());
        assertEquals(TenantStatus.ACTIVE, response.getStatus());
        assertEquals("Tenant already registered", response.getMessage());

        // Verify no duplicate user or tenant was saved
        verify(userRepository, never()).save(any(AppUser.class));
        verify(tenantRegistryRepository, never()).save(any(TenantRegistry.class));
    }

    @Test
    void shouldAccuratelyCalculate14DayTrialWindow() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime trialEnd = provisioningService.calculateTrialEndDate();

        assertNotNull(trialEnd);
        long days = ChronoUnit.DAYS.between(now, trialEnd);
        assertEquals(14, days);
    }
}

