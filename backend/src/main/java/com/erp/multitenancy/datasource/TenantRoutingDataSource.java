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
 * Dynamic routing DataSource that routes database connections based on the active TenantContext
 * and databaseRoutingKey resolved from the Redis-cached TenantRegistry.
 * <p>
 * If the routing key is null, blank, or SHARED, queries default to the primary multi-tenant pool.
 */
public class TenantRoutingDataSource extends AbstractRoutingDataSource {

    private static final Logger log = LoggerFactory.getLogger(TenantRoutingDataSource.class);
    public static final String SHARED_LOOKUP_KEY = "SHARED";

    private final Map<Object, Object> targetDataSourcesMap = new ConcurrentHashMap<>();
    private TenantRoutingKeyResolver routingKeyResolver;

    public TenantRoutingDataSource() {
        setLenientFallback(true);
    }

    public TenantRoutingDataSource(TenantRoutingKeyResolver routingKeyResolver) {
        this();
        this.routingKeyResolver = routingKeyResolver;
    }

    public void setRoutingKeyResolver(TenantRoutingKeyResolver routingKeyResolver) {
        this.routingKeyResolver = routingKeyResolver;
    }

    public TenantRoutingKeyResolver getRoutingKeyResolver() {
        return routingKeyResolver;
    }

    /**
     * Resolves the current lookup key for database routing:
     * 1. Intercepts tenantId from TenantContext.
     * 2. If tenantId has an explicit direct DataSource mapping, routes to it.
     * 3. Looks up databaseRoutingKey from the (Redis-cached) TenantRegistry.
     * 4. If routing key is null, blank, or SHARED, defaults to primary multi-tenant database.
     * 5. Otherwise routes to the dedicated pool matching the databaseRoutingKey.
     *
     * @return routing lookup key
     */
    @Override
    public Object determineCurrentLookupKey() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank() || "default".equalsIgnoreCase(tenantId)) {
            return SHARED_LOOKUP_KEY;
        }

        // Direct mapping check (e.g. hotloaded by tenantId)
        if (targetDataSourcesMap.containsKey(tenantId)) {
            log.debug("TenantRoutingDataSource resolved direct tenant DataSource for [{}]", tenantId);
            return tenantId;
        }

        // Lookup databaseRoutingKey from Redis-cached TenantRegistry
        String routingKey = null;
        if (routingKeyResolver != null) {
            try {
                routingKey = routingKeyResolver.resolveRoutingKey(tenantId);
            } catch (Exception ex) {
                log.warn("Failed to resolve routing key from registry for tenant [{}]: {}", tenantId, ex.getMessage());
            }
        }

        if (routingKey == null || routingKey.isBlank() ||
                "SHARED".equalsIgnoreCase(routingKey) ||
                "SHARED_DEFAULT".equalsIgnoreCase(routingKey)) {
            return SHARED_LOOKUP_KEY;
        }

        // Match against registered target pools (exact, uppercase, lowercase)
        if (targetDataSourcesMap.containsKey(routingKey)) {
            return routingKey;
        }
        if (targetDataSourcesMap.containsKey(routingKey.toUpperCase())) {
            return routingKey.toUpperCase();
        }
        if (targetDataSourcesMap.containsKey(routingKey.toLowerCase())) {
            return routingKey.toLowerCase();
        }

        log.debug("Routing key [{}] for tenant [{}] not found in registered pools. Defaulting to SHARED.",
                routingKey, tenantId);
        return SHARED_LOOKUP_KEY;
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
     * Hot-loads and registers a new dedicated tenant or pool DataSource into the router at runtime.
     *
     * @param routingKeyOrTenantId routing key or tenant identifier
     * @param dataSource           dedicated DataSource instance
     */
    public synchronized void addDataSource(String routingKeyOrTenantId, DataSource dataSource) {
        log.info("Registering dedicated DataSource pool for key [{}] into TenantRoutingDataSource", routingKeyOrTenantId);
        this.targetDataSourcesMap.put(routingKeyOrTenantId, dataSource);
        super.setTargetDataSources(new ConcurrentHashMap<>(this.targetDataSourcesMap));
        super.afterPropertiesSet();
    }

    /**
     * Checks if a DataSource is currently registered for the specified key or tenant.
     *
     * @param routingKeyOrTenantId routing key or tenant identifier
     * @return true if DataSource is mapped
     */
    public boolean hasDataSource(String routingKeyOrTenantId) {
        return routingKeyOrTenantId != null && (
                this.targetDataSourcesMap.containsKey(routingKeyOrTenantId) ||
                this.targetDataSourcesMap.containsKey(routingKeyOrTenantId.toUpperCase()) ||
                this.targetDataSourcesMap.containsKey(routingKeyOrTenantId.toLowerCase())
        );
    }

    /**
     * Returns an unmodifiable view of currently registered target DataSources.
     *
     * @return map of lookup keys to DataSources
     */
    public Map<Object, Object> getCurrentTargetDataSources() {
        return Collections.unmodifiableMap(this.targetDataSourcesMap);
    }

    @Override
    public DataSource determineTargetDataSource() {
        return super.determineTargetDataSource();
    }
}
