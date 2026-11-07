package com.erp.multitenancy.async;

import com.erp.multitenancy.TenantContext;
import org.springframework.core.task.TaskDecorator;
import org.springframework.stereotype.Component;

/**
 * Task decorator that captures the caller thread's tenant identifier from {@link TenantContext}
 * and establishes it within the asynchronous child execution thread, ensuring clean teardown
 * upon task completion.
 */
@Component
public class TenantAwareTaskDecorator implements TaskDecorator {

    @Override
    public Runnable decorate(Runnable runnable) {
        String parentTenantId = TenantContext.getTenantId();

        return () -> {
            try {
                if (parentTenantId != null && !parentTenantId.isBlank()) {
                    TenantContext.setTenantId(parentTenantId);
                } else {
                    TenantContext.clear();
                }
                runnable.run();
            } finally {
                TenantContext.clear();
            }
        };
    }
}
