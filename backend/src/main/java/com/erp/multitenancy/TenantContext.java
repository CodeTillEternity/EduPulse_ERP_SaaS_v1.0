package com.erp.multitenancy;

/**
 * Utility class providing thread-local storage for tenant context in a multi-tenant architecture.
 */
public final class TenantContext {

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
        // Utility class private constructor
    }

    /**
     * Set the current tenant identifier for the executing thread.
     *
     * @param tenantId Tenant identifier
     */
    public static void setTenantId(String tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    /**
     * Retrieve the current tenant identifier for the executing thread.
     *
     * @return Tenant identifier, or null if none is bound
     */
    public static String getTenantId() {
        return CURRENT_TENANT.get();
    }

    /**
     * Alias for {@link #setTenantId(String)} for API convenience.
     *
     * @param tenantId Tenant identifier
     */
    public static void setCurrentTenant(String tenantId) {
        setTenantId(tenantId);
    }

    /**
     * Alias for {@link #getTenantId()} for API convenience.
     *
     * @return Tenant identifier, or null if none is bound
     */
    public static String getCurrentTenant() {
        return getTenantId();
    }

    /**
     * Clear the tenant context from the executing thread to prevent memory leaks and thread contamination.
     */
    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
