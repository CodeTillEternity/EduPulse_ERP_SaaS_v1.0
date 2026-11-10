package com.erp.subscription.aspect;

import com.erp.common.exception.PaymentRequiredException;
import com.erp.multitenancy.TenantContext;
import com.erp.subscription.annotation.RequiresSaaSTier;
import com.erp.subscription.model.SaaSTier;
import com.erp.subscription.service.EntitlementService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * Spring AOP Aspect intercepting endpoints and service methods guarded with @RequiresSaaSTier.
 * Validates that the active tenant's subscription tier in the Central Tenant Registry
 * satisfies the required SaaS tier; otherwise throws a custom 402 PaymentRequiredException.
 */
@Aspect
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class EntitlementAspect {

    private static final Logger log = LoggerFactory.getLogger(EntitlementAspect.class);

    private final EntitlementService entitlementService;

    public EntitlementAspect(EntitlementService entitlementService) {
        this.entitlementService = entitlementService;
    }

    @Around("@annotation(requiresSaaSTier) || @within(requiresSaaSTier)")
    public Object enforceSaaSTier(ProceedingJoinPoint joinPoint, RequiresSaaSTier requiresSaaSTier) throws Throwable {
        RequiresSaaSTier annotation = requiresSaaSTier;

        if (annotation == null) {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            annotation = method.getAnnotation(RequiresSaaSTier.class);
            if (annotation == null) {
                annotation = joinPoint.getTarget().getClass().getAnnotation(RequiresSaaSTier.class);
            }
        }

        if (annotation == null) {
            return joinPoint.proceed();
        }

        SaaSTier requiredTier = annotation.value();
        String tenantId = TenantContext.getTenantId();

        if (tenantId == null || tenantId.isBlank() || "default".equalsIgnoreCase(tenantId)) {
            log.debug("No multi-tenant context bound for @RequiresSaaSTier at {}. Proceeding.",
                    joinPoint.getSignature().toShortString());
            return joinPoint.proceed();
        }

        SaaSTier currentTier = entitlementService.getTenantTier(tenantId);
        if (!currentTier.satisfies(requiredTier)) {
            log.warn("PAYMENT REQUIRED (402): Tenant [{}] on [{}] attempted to access [{}] requiring [{}]",
                    tenantId, currentTier, joinPoint.getSignature().toShortString(), requiredTier);
            throw new PaymentRequiredException(
                    String.format("Feature requires '%s' SaaS subscription tier. Current institutional plan is '%s'. Please upgrade your subscription.",
                            requiredTier.name(), currentTier.name()),
                    requiredTier,
                    currentTier
            );
        }

        return joinPoint.proceed();
    }
}
