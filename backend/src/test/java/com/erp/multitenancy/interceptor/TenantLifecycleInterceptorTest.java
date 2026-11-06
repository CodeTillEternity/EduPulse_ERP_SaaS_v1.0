package com.erp.multitenancy.interceptor;

import com.erp.multitenancy.TenantContext;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantLifecycleInterceptorTest {

    @Mock
    private TenantRegistryRepository tenantRegistryRepository;

    private TenantLifecycleInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new TenantLifecycleInterceptor(tenantRegistryRepository);
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void shouldBlockPostRequestForTenantInReadOnlyGraceStatus() throws Exception {
        String tenantId = "tenant-grace-101";
        TenantContext.setTenantId(tenantId);

        TenantRegistry tenant = new TenantRegistry(tenantId, "Grace University", TenantStatus.READ_ONLY_GRACE, "SHARED");
        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/courses");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertFalse(allowed, "Mutating POST request must be blocked for READ_ONLY_GRACE tenant");
        assertEquals(HttpServletResponse.SC_FORBIDDEN, response.getStatus());
        assertTrue(response.getContentAsString().contains("READ_ONLY_GRACE"));
    }

    @Test
    void shouldBlockPutPatchDeleteRequestsForTenantInReadOnlyGraceStatus() throws Exception {
        String tenantId = "tenant-grace-102";
        TenantContext.setTenantId(tenantId);

        TenantRegistry tenant = new TenantRegistry(tenantId, "Grace University", TenantStatus.READ_ONLY_GRACE, "SHARED");
        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

        for (String method : new String[]{"PUT", "PATCH", "DELETE"}) {
            MockHttpServletRequest request = new MockHttpServletRequest(method, "/api/v1/departments/5");
            MockHttpServletResponse response = new MockHttpServletResponse();

            boolean allowed = interceptor.preHandle(request, response, new Object());

            assertFalse(allowed, method + " request must be blocked for READ_ONLY_GRACE tenant");
            assertEquals(HttpServletResponse.SC_FORBIDDEN, response.getStatus());
        }
    }

    @Test
    void shouldAllowGetRequestForTenantInReadOnlyGraceStatus() throws Exception {
        String tenantId = "tenant-grace-103";
        TenantContext.setTenantId(tenantId);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/students");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertTrue(allowed, "Read-only GET requests must always be permitted");
        assertEquals(HttpServletResponse.SC_OK, response.getStatus());
        verify(tenantRegistryRepository, never()).findById(any());
    }

    @Test
    void shouldAllowMutatingRequestToExemptAuthEndpointsDuringGrace() throws Exception {
        String tenantId = "tenant-grace-104";
        TenantContext.setTenantId(tenantId);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/auth/logout");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertTrue(allowed, "Auth endpoints like logout must be exempt from mutation block");
        assertEquals(HttpServletResponse.SC_OK, response.getStatus());
        verify(tenantRegistryRepository, never()).findById(any());
    }

    @Test
    void shouldAllowPostRequestWhenTenantIsActive() throws Exception {
        String tenantId = "tenant-active-200";
        TenantContext.setTenantId(tenantId);

        TenantRegistry tenant = new TenantRegistry(tenantId, "Active College", TenantStatus.ACTIVE, "SHARED");
        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/students");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertTrue(allowed, "POST requests must be permitted when tenant is ACTIVE");
        assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    }

    @Test
    void shouldAllowRequestsWhenNoTenantOrTenantIsDefault() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/test");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertTrue(allowed);
        verify(tenantRegistryRepository, never()).findById(any());
    }
}
