package com.edupulse.core.multitenancy.context;

import com.edupulse.core.domain.base.TenantContext;
import org.springframework.context.annotation.Primary;
import org.springframework.core.task.TaskDecorator;
import org.springframework.stereotype.Component;

/**
 * TaskDecorator propagating tenant context across asynchronous thread boundaries
 * and background job execution pools.
 * Extracts the tenant_id from the main thread's TenantContext, attaches it to the child
 * thread during execution, and explicitly purges it in a finally block to eliminate
 * ThreadLocal memory leakage.
 */
@Component("coreTenantAwareTaskDecorator")
@Primary
public class TenantAwareTaskDecorator implements TaskDecorator {

    @Override
    public Runnable decorate(Runnable runnable) {
        // Capture tenant ID from caller/main thread's context
        String callerTenantId = TenantContext.getTenantId();
        if (callerTenantId == null || callerTenantId.isBlank()) {
            callerTenantId = com.erp.multitenancy.TenantContext.getTenantId();
        }

        final String activeTenantId = callerTenantId;

        return () -> {
            try {
                if (activeTenantId != null && !activeTenantId.isBlank()) {
                    TenantContext.setTenantId(activeTenantId);
                    com.erp.multitenancy.TenantContext.setTenantId(activeTenantId);
                } else {
                    TenantContext.clear();
                    com.erp.multitenancy.TenantContext.clear();
                }
                runnable.run();
            } finally {
                TenantContext.clear();
                com.erp.multitenancy.TenantContext.clear();
            }
        };
    }
}
