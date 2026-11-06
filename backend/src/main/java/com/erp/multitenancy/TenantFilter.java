package com.erp.multitenancy;

import com.erp.security.jwt.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Spring Web Filter that securely extracts tenant context from validated JWT claims
 * instead of trusting raw HTTP headers.
 * <p>
 * If a valid JWT token lacks a tenant_id claim on a non-public endpoint,
 * a 401 Unauthorized response is returned.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class TenantFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TenantFilter.class);

    private final JwtService jwtService;

    public TenantFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String jwt = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7).trim();
        } else if (request.getParameter("token") != null && !request.getParameter("token").isBlank()) {
            jwt = request.getParameter("token").trim();
        }

        if (jwt != null && !jwt.isBlank()) {
            try {
                String tenantId = jwtService.extractTenantId(jwt);
                if (tenantId != null && !tenantId.isBlank()) {
                    tenantId = tenantId.trim();
                    TenantContext.setTenantId(tenantId);
                    log.debug("TenantContext bound from JWT claims for tenant_id: [{}] on URI: [{}]", tenantId, request.getRequestURI());
                } else {
                    // Valid JWT format but lacks required tenant_id claim
                    if (!isPublicEndpoint(request)) {
                        log.warn("Unauthorized access: Valid JWT token lacks required tenant_id claim for URI: [{}]", request.getRequestURI());
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"success\":false,\"message\":\"JWT token lacks required tenant_id claim\"}");
                        return;
                    }
                }
            } catch (Exception ex) {
                log.debug("Token parsing skipped in TenantFilter: {}", ex.getMessage());
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
            log.debug("TenantContext cleared for URI: [{}]", request.getRequestURI());
        }
    }

    private boolean isPublicEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path == null || path.isBlank()) {
            path = request.getServletPath();
        }
        if (path == null) {
            path = "";
        }
        return "OPTIONS".equalsIgnoreCase(request.getMethod()) ||
               path.startsWith("/auth/") ||
               path.startsWith("/api/v1/saas/") ||
               path.startsWith("/api/password/") ||
               path.equals("/api/health") ||
               path.equals("/api/v1/health") ||
               path.equals("/actuator/health") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/api/v1/admissions/public/") ||
               (path.startsWith("/api/v1/students/") && path.endsWith("/photo"));
    }
}
