package com.erp.multitenancy;

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
 * Spring Web Filter that intercepts incoming HTTP requests, extracts the {@code X-Tenant-ID}
 * header, populates {@link TenantContext}, and ensures the context is cleared in the finally block.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class TenantFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TenantFilter.class);

    public static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String tenantId = request.getHeader(TENANT_HEADER);

        if (tenantId != null && !tenantId.isBlank()) {
            tenantId = tenantId.trim();
            TenantContext.setTenantId(tenantId);
            log.debug("TenantContext bound with tenant_id: [{}] for URI: [{}]", tenantId, request.getRequestURI());
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
            log.debug("TenantContext cleared for URI: [{}]", request.getRequestURI());
        }
    }
}
