package com.erp.multitenancy.interceptor;

import com.erp.multitenancy.TenantContext;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Optional;
import java.util.Set;

/**
 * Interceptor that enforces subscription lifecycle rules.
 * When a tenant is in {@link TenantStatus#READ_ONLY_GRACE}, mutating HTTP methods
 * (POST, PUT, PATCH, DELETE) are rejected with a 403 Forbidden status, except for
 * authentication and administrative management endpoints.
 */
@Component
public class TenantLifecycleInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(TenantLifecycleInterceptor.class);

    private static final Set<String> MUTATING_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");

    private final TenantRegistryRepository tenantRegistryRepository;

    public TenantLifecycleInterceptor(TenantRegistryRepository tenantRegistryRepository) {
        this.tenantRegistryRepository = tenantRegistryRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String method = request.getMethod();

        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        String path = request.getRequestURI();
        if (path == null || path.isBlank()) {
            path = request.getServletPath();
        }
        if (path == null) {
            path = "";
        }

        // Exempt auth, password reset, and public onboarding endpoints
        if (isExemptEndpoint(path)) {
            return true;
        }

        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank() || "default".equalsIgnoreCase(tenantId)) {
            return true;
        }

        Optional<TenantRegistry> tenantOpt = tenantRegistryRepository.findById(tenantId);
        if (tenantOpt.isPresent()) {
            TenantRegistry tenant = tenantOpt.get();
            TenantStatus status = tenant.getStatus();

            // Total lockout for SUSPENDED, PENDING_DELETION, or DELETED: block ALL requests including GET
            if (status == TenantStatus.SUSPENDED || status == TenantStatus.PENDING_DELETION || status == TenantStatus.DELETED) {
                log.warn("Blocked HTTP {} request to [{}] for tenant [{}] with status {}",
                        method, path, tenantId, status);
                sendForbiddenResponse(response, "Tenant account is " + status + ". Access is locked out.");
                return false;
            }

            // READ_ONLY_GRACE: block mutating methods (POST, PUT, PATCH, DELETE) while allowing safe queries
            if (status == TenantStatus.READ_ONLY_GRACE && MUTATING_METHODS.contains(method.toUpperCase())) {
                log.warn("Blocked mutating HTTP {} request to [{}] for tenant [{}] in READ_ONLY_GRACE status",
                        method, path, tenantId);
                sendForbiddenResponse(response, "Tenant account is in READ_ONLY_GRACE period. Mutating operations are forbidden.");
                return false;
            }
        }

        return true;
    }

    private boolean isExemptEndpoint(String path) {
        return path.startsWith("/auth/") ||
               path.startsWith("/api/v1/saas/") ||
               path.startsWith("/api/password/") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/swagger-ui");
    }

    private void sendForbiddenResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("{\"success\":false,\"message\":\"" + message + "\"}");
    }
}
