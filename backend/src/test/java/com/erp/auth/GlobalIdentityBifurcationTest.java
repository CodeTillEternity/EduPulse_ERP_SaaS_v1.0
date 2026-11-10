package com.erp.auth;

import com.erp.auth.controller.AuthController;
import com.erp.auth.dto.AuthResponse;
import com.erp.auth.dto.LoginRequest;
import com.erp.auth.entity.AppUser;
import com.erp.auth.entity.RefreshToken;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.auth.service.AuthService;
import com.erp.auth.service.CustomUserDetailsService;
import com.erp.auth.service.PasswordResetService;
import com.erp.auth.service.RefreshTokenService;
import com.erp.auth.service.SessionService;
import com.erp.multitenancy.TenantContext;
import com.erp.multitenancy.entity.TenantBranding;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.repository.TenantBrandingRepository;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.multitenancy.resolver.SubdomainTenantResolver;
import com.erp.security.jwt.JwtAuthenticationFilter;
import com.erp.security.jwt.JwtProperties;
import com.erp.security.jwt.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@DisplayName("Task 1: Global Identity Bifurcation & Subdomain Cryptographic Lock Tests")
class GlobalIdentityBifurcationTest {

    @Mock
    private TenantRegistryRepository tenantRegistryRepository;

    @Mock
    private TenantBrandingRepository tenantBrandingRepository;

    @Mock
    private AuthService authService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private PasswordResetService passwordResetService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private JwtProperties jwtProperties;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private SessionService sessionService;

    @Mock
    private FilterChain filterChain;

    private SubdomainTenantResolver subdomainTenantResolver;
    private AuthController authController;
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        subdomainTenantResolver = new SubdomainTenantResolver(tenantRegistryRepository, tenantBrandingRepository);

        authController = new AuthController(
                authService,
                refreshTokenService,
                passwordResetService,
                userRepository,
                jwtService,
                jwtProperties,
                subdomainTenantResolver
        );

        when(jwtProperties.getHeaderString()).thenReturn("Authorization");
        when(jwtProperties.getTokenPrefix()).thenReturn("Bearer ");

        jwtAuthenticationFilter = new JwtAuthenticationFilter(
                jwtService,
                jwtProperties,
                userDetailsService,
                sessionService,
                subdomainTenantResolver
        );
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("SubdomainTenantResolver extracts subdomain from host headers")
    void testSubdomainExtraction() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Host", "stanford.edupulse.com:8081");

        Optional<String> subdomainOpt = subdomainTenantResolver.extractSubdomain(request);
        assertTrue(subdomainOpt.isPresent());
        assertEquals("stanford", subdomainOpt.get());

        // Test explicit header override
        request.addHeader("X-Tenant-Subdomain", "dps");
        subdomainOpt = subdomainTenantResolver.extractSubdomain(request);
        assertTrue(subdomainOpt.isPresent());
        assertEquals("dps", subdomainOpt.get());
    }

    @Test
    @DisplayName("SubdomainTenantResolver ignores reserved platform subdomains")
    void testReservedSubdomainIgnored() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Host", "api.edupulse.com");

        Optional<String> subdomainOpt = subdomainTenantResolver.extractSubdomain(request);
        assertFalse(subdomainOpt.isPresent());
    }

    @Test
    @DisplayName("AuthController resolves tenant from subdomain and scopes login request")
    void testAuthControllerSubdomainResolution() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Host", "stanford.edupulse.com");
        request.setRemoteAddr("127.0.0.1");

        TenantRegistry mockRegistry = new TenantRegistry();
        mockRegistry.setTenantId("tenant-stanford");
        mockRegistry.setInstitutionName("Stanford University");

        when(tenantRegistryRepository.existsById("stanford")).thenReturn(false);
        TenantBranding mockBranding = new TenantBranding();
        mockBranding.setCustomSubdomain("stanford");
        mockBranding.setTenant(mockRegistry);
        when(tenantBrandingRepository.findByCustomSubdomainIgnoreCase("stanford"))
                .thenReturn(Optional.of(mockBranding));

        AuthResponse mockAuthResponse = new AuthResponse(
                "token123",
                "refresh123",
                "Bearer",
                900000L,
                "admin@stanford.edu",
                Role.ADMIN.name(),
                Collections.emptySet()
        );

        when(authService.login(any(LoginRequest.class), eq("127.0.0.1")))
                .thenReturn(mockAuthResponse);

        AppUser mockUser = new AppUser("admin@stanford.edu", "pass", "admin@stanford.edu", Role.ADMIN, true);
        mockUser.setId(42L);
        when(userRepository.findByUsernameIgnoreCaseAndTenantId("admin@stanford.edu", "tenant-stanford"))
                .thenReturn(Optional.of(mockUser));

        RefreshToken mockRefreshToken = new RefreshToken();
        mockRefreshToken.setToken("uuid-refresh-token");
        when(refreshTokenService.createRefreshToken(42L)).thenReturn(mockRefreshToken);

        LoginRequest loginPayload = new LoginRequest("admin@stanford.edu", "Password@123", "ADMIN", null);
        ResponseEntity<AuthResponse> response = authController.login(loginPayload, null, request);

        assertEquals(200, response.getStatusCode().value());
        ArgumentCaptor<LoginRequest> captor = ArgumentCaptor.forClass(LoginRequest.class);
        verify(authService).login(captor.capture(), eq("127.0.0.1"));
        assertEquals("tenant-stanford", captor.getValue().tenantId());
    }

    @Test
    @DisplayName("JwtAuthenticationFilter blocks token if token tenant does not match request institution subdomain")
    void testCryptographicTenantLockEnforcement() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/v1/students");
        request.setServletPath("/api/v1/students");
        request.addHeader("Authorization", "Bearer valid.jwt.token");
        request.addHeader("Host", "dps.edupulse.com");

        TenantRegistry mockRegistry = new TenantRegistry();
        mockRegistry.setTenantId("tenant-dps");
        TenantBranding mockBranding = new TenantBranding();
        mockBranding.setCustomSubdomain("dps");
        mockBranding.setTenant(mockRegistry);
        when(tenantBrandingRepository.findByCustomSubdomainIgnoreCase("dps"))
                .thenReturn(Optional.of(mockBranding));

        // Token was issued for tenant-stanford, but hitting dps institution subdomain
        when(jwtService.extractUsername("valid.jwt.token")).thenReturn("admin@school.com");
        when(jwtService.extractTokenId("valid.jwt.token")).thenReturn("tok-1");
        when(jwtService.extractTenantId("valid.jwt.token")).thenReturn("tenant-stanford");

        MockHttpServletResponse response = new MockHttpServletResponse();

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // Expect 401 Unauthorized because tenant-stanford token cannot access tenant-dps subdomain
        assertEquals(401, response.getStatus());
        assertTrue(response.getContentAsString().contains("TENANT_MISMATCH"));
        verify(filterChain, never()).doFilter(any(), any());
    }
}

