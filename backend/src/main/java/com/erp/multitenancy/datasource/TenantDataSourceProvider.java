package com.erp.multitenancy.datasource;

import javax.sql.DataSource;

/**
 * Service contract for retrieving database connection properties and constructing
 * isolated DataSource instances for dedicated tenants in a hybrid multi-tenant architecture.
 */
public interface TenantDataSourceProvider {

    /**
     * Retrieves database connection properties (URL, username, password) for the given dedicated tenant.
     *
     * @param tenantId Tenant identifier
     * @return TenantDataSourceProperties containing connection settings
     */
    TenantDataSourceProperties getDataSourceProperties(String tenantId);

    /**
     * Creates and configures a javax.sql.DataSource instance for the dedicated tenant.
     *
     * @param tenantId Tenant identifier
     * @return Configured dedicated DataSource
     */
    DataSource createDataSource(String tenantId);

    /**
     * Checks if a dedicated configuration or template exists for the tenant.
     *
     * @param tenantId Tenant identifier
     * @return true if dedicated connection properties can be supplied
     */
    boolean hasDedicatedConfiguration(String tenantId);
}
