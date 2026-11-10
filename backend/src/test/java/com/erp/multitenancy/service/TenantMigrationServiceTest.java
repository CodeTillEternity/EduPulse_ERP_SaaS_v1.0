package com.erp.multitenancy.service;

import com.erp.common.response.ApiResponse;
import com.erp.multitenancy.controller.SuperAdminController;
import com.erp.multitenancy.datasource.TenantDataSourceProvider;
import com.erp.multitenancy.datasource.TenantRoutingDataSource;
import com.erp.multitenancy.datasource.TenantRoutingKeyResolver;
import com.erp.multitenancy.dto.MigrateTenantRequestDTO;
import com.erp.multitenancy.dto.TenantMigrationResultDTO;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.AccountStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@DisplayName("Task 2: TenantMigrationService and Controller Tests")
class TenantMigrationServiceTest {

    private TenantRegistryRepository tenantRegistryRepository;
    private TenantProvisioningService tenantProvisioningService;
    private TenantRoutingDataSource routingDataSource;
    private TenantDataSourceProvider dataSourceProvider;
    private TenantRoutingKeyResolver routingKeyResolver;
    private TenantDatabaseUpgradeService tenantDatabaseUpgradeService;

    private TenantMigrationService migrationService;
    private SuperAdminController superAdminController;

    private JdbcDataSource sharedDataSource;
    private JdbcDataSource dedicatedDataSource;

    @BeforeEach
    void setUp() {
        tenantRegistryRepository = mock(TenantRegistryRepository.class);
        tenantProvisioningService = mock(TenantProvisioningService.class);
        dataSourceProvider = mock(TenantDataSourceProvider.class);
        routingKeyResolver = mock(TenantRoutingKeyResolver.class);
        tenantDatabaseUpgradeService = mock(TenantDatabaseUpgradeService.class);

        // Setup in-memory H2 source and target data sources
        sharedDataSource = new JdbcDataSource();
        sharedDataSource.setURL("jdbc:h2:mem:shared_migration_test;DB_CLOSE_DELAY=-1;NON_KEYWORDS=VALUE");
        sharedDataSource.setUser("sa");
        sharedDataSource.setPassword("");

        dedicatedDataSource = new JdbcDataSource();
        dedicatedDataSource.setURL("jdbc:h2:mem:dedicated_migration_test;DB_CLOSE_DELAY=-1;NON_KEYWORDS=VALUE");
        dedicatedDataSource.setUser("sa");
        dedicatedDataSource.setPassword("");

        // Initialize schema and sample rows in shared DB
        JdbcTemplate sharedJdbc = new JdbcTemplate(sharedDataSource);
        sharedJdbc.execute("DROP ALL OBJECTS");
        sharedJdbc.execute("CREATE TABLE users (id BIGINT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50), email VARCHAR(100), tenant_id VARCHAR(64))");
        sharedJdbc.execute("CREATE TABLE department (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), tenant_id VARCHAR(64))");

        sharedJdbc.update("INSERT INTO users (username, email, tenant_id) VALUES (?, ?, ?)", "admin_apex", "admin@apex.edu", "tenant-apex");
        sharedJdbc.update("INSERT INTO users (username, email, tenant_id) VALUES (?, ?, ?)", "other_user", "user@other.edu", "tenant-other");
        sharedJdbc.update("INSERT INTO department (name, tenant_id) VALUES (?, ?)", "Computer Science", "tenant-apex");

        // Initialize target dedicated DB
        JdbcTemplate dedicatedJdbc = new JdbcTemplate(dedicatedDataSource);
        dedicatedJdbc.execute("DROP ALL OBJECTS");
        dedicatedJdbc.execute("CREATE TABLE users (id BIGINT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50), email VARCHAR(100), tenant_id VARCHAR(64))");
        dedicatedJdbc.execute("CREATE TABLE department (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), tenant_id VARCHAR(64))");

        routingDataSource = new TenantRoutingDataSource();
        routingDataSource.setDefaultTargetDataSource(sharedDataSource);
        Map<Object, Object> targets = new HashMap<>();
        targets.put("SHARED", sharedDataSource);
        targets.put("dedicated-vip-1", dedicatedDataSource);
        routingDataSource.setTargetDataSources(targets);
        routingDataSource.afterPropertiesSet();

        migrationService = new TenantMigrationService(
                tenantRegistryRepository,
                tenantProvisioningService,
                routingDataSource,
                dataSourceProvider,
                routingKeyResolver
        );

        superAdminController = new SuperAdminController(
                tenantRegistryRepository,
                tenantDatabaseUpgradeService,
                tenantProvisioningService,
                migrationService
        );
    }

    @Test
    @DisplayName("Should successfully execute 5-step migration from shared pool to dedicated database")
    void shouldExecute5StepMigrationSuccessfully() {
        String tenantId = "tenant-apex";
        TenantRegistry tenant = new TenantRegistry();
        tenant.setTenantId(tenantId);
        tenant.setInstitutionName("Apex University");
        tenant.setAccountStatus(AccountStatus.ACTIVE);
        tenant.setDatabaseRoutingKey("SHARED_DEFAULT");
        tenant.setDatabaseMode("SHARED");

        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(tenantRegistryRepository.save(any(TenantRegistry.class))).thenAnswer(i -> i.getArgument(0));

        // Execute migration
        TenantMigrationResultDTO result = migrationService.migrateTenantToDedicated(tenantId, "dedicated-vip-1");

        // Verify Step 1 & Step 5 sequential execution in exact order
        InOrder inOrder = Mockito.inOrder(tenantProvisioningService);
        inOrder.verify(tenantProvisioningService).updateTenantStatus(tenantId, AccountStatus.SUSPENDED);
        inOrder.verify(tenantProvisioningService).updateTenantStatus(tenantId, AccountStatus.ACTIVE);

        // Verify Step 4: TenantRegistry updated
        assertThat(tenant.getDatabaseRoutingKey()).isEqualTo("dedicated-vip-1");
        assertThat(tenant.getDatabaseMode()).isEqualTo("DEDICATED");
        verify(tenantRegistryRepository).save(tenant);
        verify(routingKeyResolver).updateRoutingKey(tenantId, "dedicated-vip-1");

        // Verify Step 3: Data copied into dedicated database
        JdbcTemplate dedicatedJdbc = new JdbcTemplate(dedicatedDataSource);
        Integer userCount = dedicatedJdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE tenant_id = ?", Integer.class, tenantId);
        assertThat(userCount).isEqualTo(1);

        Integer deptCount = dedicatedJdbc.queryForObject(
                "SELECT COUNT(*) FROM department WHERE tenant_id = ?", Integer.class, tenantId);
        assertThat(deptCount).isEqualTo(1);

        // Verify other tenants were not copied
        Integer otherCount = dedicatedJdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE tenant_id = 'tenant-other'", Integer.class);
        assertThat(otherCount).isEqualTo(0);

        // Verify result DTO
        assertThat(result.tenantId()).isEqualTo(tenantId);
        assertThat(result.databaseRoutingKey()).isEqualTo("dedicated-vip-1");
        assertThat(result.databaseMode()).isEqualTo("DEDICATED");
        assertThat(result.accountStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(result.totalRowsMigrated()).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("SuperAdminController POST /api/v1/saas/admin/tenants/{tenantId}/migrate endpoint works")
    void shouldExposeMigrateEndpointInSuperAdminController() {
        String tenantId = "tenant-apex";
        TenantRegistry tenant = new TenantRegistry();
        tenant.setTenantId(tenantId);
        tenant.setAccountStatus(AccountStatus.ACTIVE);

        when(tenantRegistryRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(tenantRegistryRepository.save(any(TenantRegistry.class))).thenAnswer(i -> i.getArgument(0));

        MigrateTenantRequestDTO request = new MigrateTenantRequestDTO("dedicated-vip-1");
        ResponseEntity<ApiResponse<TenantMigrationResultDTO>> response =
                superAdminController.migrateTenantToDedicated(tenantId, request);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData().tenantId()).isEqualTo(tenantId);
        assertThat(response.getBody().getData().databaseRoutingKey()).isEqualTo("dedicated-vip-1");
    }
}
