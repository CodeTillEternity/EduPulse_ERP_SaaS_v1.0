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
 * Filter ensuring the TenantContext ThreadLocal is strictly initialized and purged in a finally block,
 * guaranteeing zero thread state bleeding across pooled HikariCP execution worker threads.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TenantContextFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TenantContextFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String tenantHeader = request.getHeader("X-Tenant-ID");
            if (tenantHeader != null && !tenantHeader.isBlank()) {
                TenantContext.setTenantId(tenantHeader.trim());
                log.debug("TenantContext bound from X-Tenant-ID header: [{}]", tenantHeader);
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
            log.trace("TenantContext guaranteed purged in finally block for thread [{}]", Thread.currentThread().getName());
        }
    }
}
