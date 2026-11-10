package com.erp.multitenancy;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.multitenancy.entity.TenantBranding;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.AccountStatus;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantBrandingRepository;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.multitenancy.service.TenantProvisioningService;
import com.erp.security.jwt.JwtService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@DisplayName("Task 2: Central Tenant Registry, Provisioning & Suspension Guard Tests")
class CentralTenantRegistryAndProvisioningTest {

    @Mock
    private TenantRegistryRepository tenantRegistryRepository;

    @Mock
    private TenantBrandingRepository tenantBrandingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private FilterChain filterChain;

    private TenantProvisioningService tenantProvisioningService;
    private TenantFilter tenantFilter;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        when(passwordEncoder.encode(anyString())).thenReturn("hashed-pwd");
        when(tenantRegistryRepository.save(any(TenantRegistry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        tenantProvisioningService = new TenantProvisioningService(
                tenantRegistryRepository,
                tenantBrandingRepository,
                userRepository,
                passwordEncoder,
                null,
                null
        );

        tenantFilter = new TenantFilter(jwtService, tenantRegistryRepository);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("provisionNewInstitution provisions registry entry, 14-day trial, and initial SUPERADMIN user")
    void testProvisionNewInstitution() {
        when(tenantRegistryRepository.findByInstitutionNameIgnoreCase("St. Xavier International School"))
                .thenReturn(Optional.empty());
        when(tenantRegistryRepository.findByAdminEmailIgnoreCase("admin@stxavier.edu"))
                .thenReturn(Optional.empty());
        when(tenantRegistryRepository.existsBySubdomainIgnoreCase(anyString())).thenReturn(false);

        TenantRegistry result = tenantProvisioningService.provisionNewInstitution(
                "St. Xavier International School",
                "admin@stxavier.edu"
        );

        assertNotNull(result);
        assertEquals("St. Xavier International School", result.getInstitutionName());
        assertEquals("admin@stxavier.edu", result.getAdminEmail());
        assertEquals("st-xavier-international", result.getSubdomain());
        assertEquals("TRIAL", result.getSubscriptionTier());
        assertEquals(AccountStatus.TRIAL, result.getAccountStatus());
        assertEquals("SHARED_DEFAULT", result.getDatabaseRoutingKey());
        assertNotNull(result.getTrialEndDate());
        assertTrue(result.getTrialEndDate().isAfter(LocalDateTime.now().plusDays(13)));

        // Verify branding namespace was created
        verify(tenantBrandingRepository).save(any(TenantBranding.class));

        // Verify SUPERADMIN user was seeded
        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository).save(userCaptor.capture());
        AppUser seededUser = userCaptor.getValue();
        assertEquals("admin@stxavier.edu", seededUser.getUsername());
        assertEquals("admin@stxavier.edu", seededUser.getEmail());
        assertEquals(Role.SUPER_ADMIN, seededUser.getRole());
        assertEquals(result.getTenantId(), seededUser.getTenantId());
        assertTrue(seededUser.isEnabled());
    }

    @Test
    @DisplayName("updateTenantStatus updates accountStatus and syncs legacy status")
    void testUpdateTenantStatus() {
        TenantRegistry existing = new TenantRegistry("tenant-dps", "DPS", "dps", "PRO", AccountStatus.ACTIVE);
        when(tenantRegistryRepository.findById("tenant-dps")).thenReturn(Optional.of(existing));

        TenantRegistry updated = tenantProvisioningService.updateTenantStatus("tenant-dps", AccountStatus.SUSPENDED);

        assertEquals(AccountStatus.SUSPENDED, updated.getAccountStatus());
        assertEquals(TenantStatus.SUSPENDED, updated.getStatus());
        verify(tenantRegistryRepository).save(existing);
    }

    @Test
    @DisplayName("TenantFilter blocks all API access with 403 Forbidden if tenant is SUSPENDED")
    void testSuspensionBlockInTenantFilter() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/v1/students/directory");
        request.addHeader("Authorization", "Bearer valid.jwt.token");

        when(jwtService.extractTenantId("valid.jwt.token")).thenReturn("tenant-bad");

        TenantRegistry suspendedTenant = new TenantRegistry("tenant-bad", "Bad School", "bad", "TRIAL", AccountStatus.SUSPENDED);
        when(tenantRegistryRepository.findById("tenant-bad")).thenReturn(Optional.of(suspendedTenant));

        MockHttpServletResponse response = new MockHttpServletResponse();

        tenantFilter.doFilter(request, response, filterChain);

        assertEquals(403, response.getStatus());
        assertTrue(response.getContentAsString().contains("TENANT_SUSPENDED"));
        verify(filterChain, never()).doFilter(any(), any());
    }
}
