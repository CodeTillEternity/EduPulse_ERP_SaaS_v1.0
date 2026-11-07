package com.erp.multitenancy.service;

import com.erp.common.exception.ResourceNotFoundException;
import com.erp.multitenancy.datasource.TenantDataSourceProvider;
import com.erp.multitenancy.datasource.TenantRoutingDataSource;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;

/**
 * Service managing database tier transitions and runtime dynamic DataSource hot-loading.
 */
@Service
public class TenantDatabaseUpgradeService {

    private static final Logger log = LoggerFactory.getLogger(TenantDatabaseUpgradeService.class);

    private final TenantRegistryRepository tenantRegistryRepository;
    private final TenantRoutingDataSource routingDataSource;
    private final TenantDataSourceProvider dataSourceProvider;

    public TenantDatabaseUpgradeService(
            TenantRegistryRepository tenantRegistryRepository,
            TenantRoutingDataSource routingDataSource,
            TenantDataSourceProvider dataSourceProvider) {
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.routingDataSource = routingDataSource;
        this.dataSourceProvider = dataSourceProvider;
    }

    /**
     * Upgrades a tenant from SHARED to DEDICATED database mode and hot-loads their isolated DataSource.
     *
     * @param tenantId Target tenant identifier
     * @return Updated TenantRegistry record
     */
    @Transactional
    public TenantRegistry upgradeToDedicatedDatabase(String tenantId) {
        TenantRegistry tenant = tenantRegistryRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with ID: " + tenantId));

        log.info("Upgrading tenant [{}] to DEDICATED database mode", tenantId);
        tenant.setDatabaseMode("DEDICATED");
        TenantRegistry updatedTenant = tenantRegistryRepository.save(tenant);

        // Dynamically instantiate and hot-load the dedicated DataSource into routing router
        DataSource dedicatedDataSource = dataSourceProvider.createDataSource(tenantId);
        routingDataSource.addDataSource(tenantId, dedicatedDataSource);

        log.info("Successfully provisioned and hot-loaded dedicated DataSource for tenant [{}]", tenantId);
        return updatedTenant;
    }
}
