package com.edupulse.core.domain.base;

/**
 * ThreadLocal tenant identity holder for the EduPulse core domain.
 * Delegates seamlessly to the platform-wide multi-tenancy context.
 */
public final class TenantContext {

    private TenantContext() {
        // Prevent direct instantiation
    }

    /**
     * Sets the active tenant ID for the executing thread.
     *
     * @param tenantId Tenant identifier
     */
    public static void setTenantId(String tenantId) {
        com.erp.multitenancy.TenantContext.setTenantId(tenantId);
    }

    /**
     * Retrieves the active tenant ID for the executing thread.
     *
     * @return Tenant identifier, or null if unbound
     */
    public static String getTenantId() {
        return com.erp.multitenancy.TenantContext.getTenantId();
    }

    /**
     * Clears the active tenant context for the current thread.
     */
    public static void clear() {
        com.erp.multitenancy.TenantContext.clear();
    }
}
