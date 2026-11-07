package com.erp.multitenancy.datasource;

import com.erp.multitenancy.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Dynamic routing DataSource that routes database connections based on the current tenant ID.
 * Extends Spring's {@link AbstractRoutingDataSource} and integrates with {@link TenantContext}.
 * 
 * Supports runtime hot-loading of dedicated tenant DataSources.
 */
public class TenantRoutingDataSource extends AbstractRoutingDataSource {

    private static final Logger log = LoggerFactory.getLogger(TenantRoutingDataSource.class);

    private final Map<Object, Object> targetDataSourcesMap = new ConcurrentHashMap<>();

    public TenantRoutingDataSource() {
        setLenientFallback(true);
    }

    /**
     * Resolves the current lookup key for database routing directly from TenantContext.
     *
     * @return current tenant_id string or null if unpartitioned/platform scope
     */
    @Override
    protected Object determineCurrentLookupKey() {
        String tenantId = TenantContext.getTenantId();
        if (log.isDebugEnabled()) {
            log.debug("TenantRoutingDataSource lookup key resolved to: [{}]", tenantId);
        }
        return tenantId;
    }

    @Override
    public void setTargetDataSources(Map<Object, Object> targetDataSources) {
        this.targetDataSourcesMap.clear();
        if (targetDataSources != null) {
            this.targetDataSourcesMap.putAll(targetDataSources);
        }
        super.setTargetDataSources(new ConcurrentHashMap<>(this.targetDataSourcesMap));
    }

    /**
     * Hot-loads and registers a new dedicated tenant DataSource into the router at runtime.
     *
     * @param tenantId Tenant identifier
     * @param dataSource Dedicated DataSource instance
     */
    public synchronized void addDataSource(String tenantId, DataSource dataSource) {
        log.info("Hot-loading dedicated DataSource for tenant [{}] into TenantRoutingDataSource", tenantId);
        this.targetDataSourcesMap.put(tenantId, dataSource);
        super.setTargetDataSources(new ConcurrentHashMap<>(this.targetDataSourcesMap));
        super.afterPropertiesSet();
    }

    /**
     * Checks if an isolated DataSource is currently registered for the specified tenant.
     *
     * @param tenantId Tenant identifier
     * @return true if isolated DataSource is mapped
     */
    public boolean hasDataSource(String tenantId) {
        return tenantId != null && this.targetDataSourcesMap.containsKey(tenantId);
    }

    /**
     * Returns an unmodifiable view of currently registered target DataSources.
     *
     * @return map of tenant lookup keys to DataSources
     */
    public Map<Object, Object> getCurrentTargetDataSources() {
        return Collections.unmodifiableMap(this.targetDataSourcesMap);
    }
}
