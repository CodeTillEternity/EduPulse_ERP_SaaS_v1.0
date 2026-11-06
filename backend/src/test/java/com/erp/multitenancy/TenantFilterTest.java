package com.erp.multitenancy;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class TenantFilterTest {

    private TenantFilter tenantFilter;

    @BeforeEach
    void setUp() {
        tenantFilter = new TenantFilter();
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void shouldExtractTenantIdAndSetInContextThenClearInFinally() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/students");
        request.addHeader("X-Tenant-ID", "tenant-college-101");
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicReference<String> tenantInChain = new AtomicReference<>();
        FilterChain chain = (req, res) -> tenantInChain.set(TenantContext.getTenantId());

        tenantFilter.doFilter(request, response, chain);

        assertEquals("tenant-college-101", tenantInChain.get(), "TenantContext should contain tenant ID during filter chain execution");
        assertNull(TenantContext.getTenantId(), "TenantContext must be cleared after filter completion");
    }

    @Test
    void shouldHandleMissingTenantIdHeaderGracefully() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/health");
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicReference<String> tenantInChain = new AtomicReference<>();
        FilterChain chain = (req, res) -> tenantInChain.set(TenantContext.getTenantId());

        tenantFilter.doFilter(request, response, chain);

        assertNull(tenantInChain.get(), "TenantContext should remain null when header is absent");
        assertNull(TenantContext.getTenantId(), "TenantContext should remain null after filter completion");
    }

    @Test
    void shouldClearContextEvenWhenChainThrowsException() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/departments");
        request.addHeader("X-Tenant-ID", "tenant-faulty");
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain throwingChain = (req, res) -> {
            assertEquals("tenant-faulty", TenantContext.getTenantId());
            throw new RuntimeException("Simulated downstream filter failure");
        };

        assertThrows(RuntimeException.class, () -> tenantFilter.doFilter(request, response, throwingChain));
        assertNull(TenantContext.getTenantId(), "TenantContext must be cleared in finally block even when an exception is thrown");
    }
}
