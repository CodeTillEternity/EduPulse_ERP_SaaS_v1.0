package com.erp.multitenancy.datasource;

/**
 * Interface contract for resolving and caching tenant database routing keys.
 */
public interface TenantRoutingKeyResolver {

    /**
     * Resolves the target database routing key for the given tenant ID.
     *
     * @param tenantId the tenant identifier
     * @return routing key (e.g., "SHARED", "dedicated-vip-1", "DEDICATED_VIP_1")
     */
    String resolveRoutingKey(String tenantId);

    /**
     * Evicts the cached routing key for the specified tenant.
     *
     * @param tenantId the tenant identifier
     */
    void evictRoutingKey(String tenantId);

    /**
     * Updates the cached routing key for the specified tenant.
     *
     * @param tenantId   the tenant identifier
     * @param routingKey the newly assigned database routing key
     */
    void updateRoutingKey(String tenantId, String routingKey);
}

