package com.erp.config;

import com.erp.multitenancy.datasource.TenantDataSourceProvider;
import com.erp.multitenancy.datasource.TenantRoutingDataSource;
import com.erp.multitenancy.datasource.TenantRoutingKeyResolver;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Multi-tenant database configuration managing dynamic routing datasources.
 * Configures TenantRoutingDataSource with the primary shared database as default
 * and dynamically registers dedicated tenant datasources.
 */
@Configuration
@EnableJpaAuditing
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${multitenancy.dedicated.mock-tenant-id:mock-dedicated-tenant}")
    private String mockTenantId;

    @Value("${multitenancy.datasources.dedicated-vip-1.jdbc-url:#{null}}")
    private String dedicatedVip1Url;

    @Value("${multitenancy.datasources.dedicated-vip-1.username:sa}")
    private String dedicatedVip1Username;

    @Value("${multitenancy.datasources.dedicated-vip-1.password:}")
    private String dedicatedVip1Password;

    @Value("${multitenancy.datasources.dedicated-vip-1.driver-class-name:org.h2.Driver}")
    private String dedicatedVip1Driver;

    /**
     * Primary DataSource bean replacing the default single datasource with a multi-tenant dynamic router.
     * The shared platform database serves as defaultTargetDataSource for common and unpartitioned requests.
     */
    @Bean
    @Primary
    public TenantRoutingDataSource dataSource(
            DataSourceProperties properties,
            TenantDataSourceProvider tenantDataSourceProvider,
            @Autowired(required = false) TenantRoutingKeyResolver routingKeyResolver) {

        DataSource sharedDataSource = properties.initializeDataSourceBuilder().build();
        if (sharedDataSource instanceof HikariDataSource hikariDs) {
            hikariDs.setPoolName("EduPulseHikariCP");
        }

        TenantRoutingDataSource routingDataSource = new TenantRoutingDataSource();
        routingDataSource.setDefaultTargetDataSource(sharedDataSource);
        if (routingKeyResolver != null) {
            routingDataSource.setRoutingKeyResolver(routingKeyResolver);
        }

        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("SHARED", sharedDataSource);
        targetDataSources.put("SHARED_DEFAULT", sharedDataSource);

        // Pre-register dedicated-vip-1 HikariCP pool if configured
        if (dedicatedVip1Url != null && !dedicatedVip1Url.isBlank()) {
            try {
                HikariConfig hikariConfig = new HikariConfig();
                hikariConfig.setPoolName("EduPulse-Dedicated-VIP-1-HikariPool");
                hikariConfig.setJdbcUrl(dedicatedVip1Url);
                hikariConfig.setUsername(dedicatedVip1Username);
                hikariConfig.setPassword(dedicatedVip1Password);
                hikariConfig.setDriverClassName(dedicatedVip1Driver);
                hikariConfig.setMaximumPoolSize(15);
                hikariConfig.setMinimumIdle(3);
                HikariDataSource vip1Ds = new HikariDataSource(hikariConfig);

                targetDataSources.put("dedicated-vip-1", vip1Ds);
                targetDataSources.put("DEDICATED_VIP_1", vip1Ds);
                log.info("Initialized dedicated HikariCP pool for [dedicated-vip-1]");
            } catch (Exception ex) {
                log.warn("Could not initialize dedicated-vip-1 pool: {}", ex.getMessage());
            }
        }

        // Pre-register mocked dedicated database for testing
        if (tenantDataSourceProvider != null && tenantDataSourceProvider.hasDedicatedConfiguration(mockTenantId)) {
            DataSource mockDedicatedDs = tenantDataSourceProvider.createDataSource(mockTenantId);
            targetDataSources.put(mockTenantId, mockDedicatedDs);
            log.info("Initialized dynamic routing with mocked dedicated DataSource for [{}]", mockTenantId);
        }

        routingDataSource.setTargetDataSources(targetDataSources);
        routingDataSource.afterPropertiesSet();
        return routingDataSource;
    }

    /**
     * On application startup, queries the TenantRegistry for any tenants with DEDICATED database mode
     * and dynamically registers their isolated DataSources into the routing router.
     */
    @Bean
    public ApplicationRunner initializeDedicatedDataSources(
            TenantRoutingDataSource routingDataSource,
            TenantRegistryRepository tenantRegistryRepository,
            TenantDataSourceProvider dataSourceProvider) {
        return args -> {
            try {
                List<TenantRegistry> dedicatedTenants = tenantRegistryRepository.findByDatabaseMode("DEDICATED");
                for (TenantRegistry tenant : dedicatedTenants) {
                    if (!routingDataSource.hasDataSource(tenant.getTenantId())) {
                        DataSource ds = dataSourceProvider.createDataSource(tenant.getTenantId());
                        routingDataSource.addDataSource(tenant.getTenantId(), ds);
                        log.info("Dynamically registered dedicated database for existing tenant [{}] during startup", tenant.getTenantId());
                    }
                }
            } catch (Exception ex) {
                log.warn("Notice: could not load dedicated tenants from registry on startup: {}", ex.getMessage());
            }
        };
    }
}
