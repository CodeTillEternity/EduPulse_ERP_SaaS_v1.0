package com.erp.common.ratelimit;

import com.erp.multitenancy.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;

class RateLimitInterceptorTest {

    private RateLimitInterceptor interceptor;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        interceptor = new RateLimitInterceptor(null);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        interceptor.clearLocalBuckets();
    }

    @Test
    @DisplayName("Should permit public request within 100 rpm limit and populate remaining header")
    void testPublicEndpointWithinLimit() throws Exception {
        request.setRequestURI("/api/auth/login");
        request.setRemoteAddr("192.168.1.100");

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertTrue(allowed);
        assertEquals(200, response.getStatus());
        assertNotNull(response.getHeader("X-Rate-Limit-Remaining"));
    }

    @Test
    @DisplayName("Should reject public endpoint with 429 Too Many Requests when 100 rpm limit is exceeded")
    void testPublicEndpointExceedLimit() throws Exception {
        request.setRequestURI("/api/auth/login");
        request.setRemoteAddr("10.0.0.5");

        // Consume 100 tokens
        for (int i = 0; i < 100; i++) {
            MockHttpServletResponse resp = new MockHttpServletResponse();
            assertTrue(interceptor.preHandle(request, resp, new Object()));
        }

        // 101st request should be rejected with 429
        MockHttpServletResponse rejectedResponse = new MockHttpServletResponse();
        boolean allowed = interceptor.preHandle(request, rejectedResponse, new Object());

        assertFalse(allowed);
        assertEquals(429, rejectedResponse.getStatus());
        assertNotNull(rejectedResponse.getHeader("Retry-After"));
        assertTrue(rejectedResponse.getContentAsString().contains("Too Many Requests"));
        assertTrue(rejectedResponse.getContentAsString().contains("429"));
    }

    @Test
    @DisplayName("Should permit authenticated request scoped by tenantId up to 300 rpm limit")
    void testAuthenticatedEndpointTenantScoping() throws Exception {
        TenantContext.setTenantId("alpha_college");
        request.setRequestURI("/api/v1/students");
        request.setRemoteAddr("10.0.0.20");

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertTrue(allowed);
        assertEquals(200, response.getStatus());
        assertNotNull(response.getHeader("X-Rate-Limit-Remaining"));
    }

    @Test
    @DisplayName("Should block authenticated request when tenant exceeds 300 rpm limit")
    void testAuthenticatedEndpointExceedLimit() throws Exception {
        TenantContext.setTenantId("heavy_tenant");
        request.setRequestURI("/api/v1/finance/invoices");
        request.setRemoteAddr("10.0.0.30");

        // Consume 300 tokens
        for (int i = 0; i < 300; i++) {
            MockHttpServletResponse resp = new MockHttpServletResponse();
            assertTrue(interceptor.preHandle(request, resp, new Object()));
        }

        // 301st request
        MockHttpServletResponse rejectedResponse = new MockHttpServletResponse();
        boolean allowed = interceptor.preHandle(request, rejectedResponse, new Object());

        assertFalse(allowed);
        assertEquals(429, rejectedResponse.getStatus());
        assertNotNull(rejectedResponse.getHeader("Retry-After"));
        assertTrue(rejectedResponse.getContentAsString().contains("Rate limit exceeded"));
    }
}
