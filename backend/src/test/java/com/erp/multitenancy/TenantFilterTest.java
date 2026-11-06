package com.erp.multitenancy;

import com.erp.security.jwt.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantFilterTest {

    @Mock
    private JwtService jwtService;

    private TenantFilter tenantFilter;

    @BeforeEach
    void setUp() {
        tenantFilter = new TenantFilter(jwtService);
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void shouldExtractTenantIdFromJwtClaimsAndSetInContextThenClearInFinally() throws ServletException, IOException {
        String token = "sample.valid.jwt";
        when(jwtService.extractTenantId(token)).thenReturn("tenant-college-101");

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/students");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicReference<String> tenantInChain = new AtomicReference<>();
        FilterChain chain = (req, res) -> tenantInChain.set(TenantContext.getTenantId());

        tenantFilter.doFilter(request, response, chain);

        assertEquals("tenant-college-101", tenantInChain.get(), "TenantContext should contain tenant ID during filter chain execution");
        assertNull(TenantContext.getTenantId(), "TenantContext must be cleared after filter completion");
        assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    }

    @Test
    void shouldReturn401WhenJwtIsValidButLacksTenantIdOnNonPublicEndpoint() throws ServletException, IOException {
        String token = "sample.notenant.jwt";
        when(jwtService.extractTenantId(token)).thenReturn(null);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/departments");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain chain = mock(FilterChain.class);

        tenantFilter.doFilter(request, response, chain);

        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.getStatus());
        assertTrue(response.getContentAsString().contains("lacks required tenant_id claim"));
        verify(chain, never()).doFilter(any(), any());
        assertNull(TenantContext.getTenantId());
    }

    @Test
    void shouldAllowPublicEndpointEvenIfJwtLacksTenantId() throws ServletException, IOException {
        String token = "sample.public.jwt";
        when(jwtService.extractTenantId(token)).thenReturn(null);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/health");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain chain = mock(FilterChain.class);

        tenantFilter.doFilter(request, response, chain);

        assertEquals(HttpServletResponse.SC_OK, response.getStatus());
        verify(chain, times(1)).doFilter(any(), any());
        assertNull(TenantContext.getTenantId());
    }

    @Test
    void shouldHandleMissingAuthHeaderGracefully() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/health");
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain chain = mock(FilterChain.class);

        tenantFilter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(any(), any());
        assertNull(TenantContext.getTenantId());
    }

    @Test
    void shouldClearContextEvenWhenChainThrowsException() {
        String token = "sample.throwing.jwt";
        when(jwtService.extractTenantId(token)).thenReturn("tenant-error");

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/classes");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain throwingChain = (req, res) -> {
            assertEquals("tenant-error", TenantContext.getTenantId());
            throw new RuntimeException("Downstream failure");
        };

        assertThrows(RuntimeException.class, () -> tenantFilter.doFilter(request, response, throwingChain));
        assertNull(TenantContext.getTenantId(), "TenantContext must be cleared in finally block");
    }
}
