package com.erp.multitenancy.datasource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Default implementation of TenantDataSourceProvider that resolves dedicated tenant database
 * connection properties from application configuration properties.
 */
@Service
public class ConfigurationDataSourceProvider implements TenantDataSourceProvider {

    private static final Logger log = LoggerFactory.getLogger(ConfigurationDataSourceProvider.class);

    @Value("${multitenancy.dedicated.url:jdbc:h2:mem:dedicated_secondary_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE}")
    private String defaultDedicatedUrl;

    @Value("${multitenancy.dedicated.username:sa}")
    private String defaultDedicatedUsername;

    @Value("${multitenancy.dedicated.password:}")
    private String defaultDedicatedPassword;

    @Value("${multitenancy.dedicated.driver-class-name:org.h2.Driver}")
    private String defaultDedicatedDriverClassName;

    private final Map<String, TenantDataSourceProperties> configuredTenants = new ConcurrentHashMap<>();

    public ConfigurationDataSourceProvider() {
    }

    /**
     * Programmatically registers custom database properties for a dedicated tenant.
     *
     * @param tenantId Tenant identifier
     * @param properties Custom database connection properties
     */
    public void registerTenantProperties(String tenantId, TenantDataSourceProperties properties) {
        configuredTenants.put(tenantId, properties);
    }

    @Override
    public TenantDataSourceProperties getDataSourceProperties(String tenantId) {
        if (configuredTenants.containsKey(tenantId)) {
            return configuredTenants.get(tenantId);
        }

        // Generate tenant-isolated database URL from the configured secondary database template
        String resolvedUrl = defaultDedicatedUrl.contains("{tenantId}")
                ? defaultDedicatedUrl.replace("{tenantId}", tenantId)
                : defaultDedicatedUrl.contains("dedicated_secondary_db")
                    ? defaultDedicatedUrl.replace("dedicated_secondary_db", "dedicated_" + tenantId)
                    : defaultDedicatedUrl;

        return new TenantDataSourceProperties(
                resolvedUrl,
                defaultDedicatedUsername,
                defaultDedicatedPassword,
                defaultDedicatedDriverClassName
        );
    }

    @Override
    public DataSource createDataSource(String tenantId) {
        TenantDataSourceProperties props = getDataSourceProperties(tenantId);
        log.info("Building dedicated DataSource for tenant [{}] with URL: {}", tenantId, props.getUrl());

        return DataSourceBuilder.create()
                .url(props.getUrl())
                .username(props.getUsername())
                .password(props.getPassword())
                .driverClassName(props.getDriverClassName())
                .build();
    }

    @Override
    public boolean hasDedicatedConfiguration(String tenantId) {
        return configuredTenants.containsKey(tenantId) || (defaultDedicatedUrl != null && !defaultDedicatedUrl.isBlank());
    }
}
