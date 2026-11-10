package com.erp.multitenancy.datasource;

import com.erp.multitenancy.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.datasource.AbstractDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class TenantRoutingDataSourceTest {

    private static class StubDataSource extends AbstractDataSource {
        private final String name;

        StubDataSource(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        @Override
        public Connection getConnection() throws SQLException {
            return null;
        }

        @Override
        public Connection getConnection(String username, String password) throws SQLException {
            return null;
        }
    }

    private StubDataSource defaultSharedDataSource;
    private StubDataSource dedicatedDataSource;
    private StubDataSource dedicatedVipDataSource;
    private TenantRoutingDataSource routingDataSource;
    private TenantRoutingKeyResolver mockKeyResolver;

    @BeforeEach
    void setUp() {
        TenantContext.clear();

        defaultSharedDataSource = new StubDataSource("shared-db");
        dedicatedDataSource = new StubDataSource("dedicated-alpha-db");
        dedicatedVipDataSource = new StubDataSource("dedicated-vip-1-db");

        routingDataSource = new TenantRoutingDataSource();
        routingDataSource.setDefaultTargetDataSource(defaultSharedDataSource);

        mockKeyResolver = mock(TenantRoutingKeyResolver.class);
        routingDataSource.setRoutingKeyResolver(mockKeyResolver);

        Map<Object, Object> targets = new HashMap<>();
        targets.put("SHARED", defaultSharedDataSource);
        targets.put("tenant-dedicated-alpha", dedicatedDataSource);
        targets.put("dedicated-vip-1", dedicatedVipDataSource);

        routingDataSource.setTargetDataSources(targets);
        routingDataSource.afterPropertiesSet();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("Should resolve to isolated dedicated DataSource when tenant ID is mapped directly")
    void shouldResolveToDedicatedDataSource() {
        TenantContext.setTenantId("tenant-dedicated-alpha");

        DataSource resolved = routingDataSource.determineTargetDataSource();

        assertThat(resolved).isSameAs(dedicatedDataSource);
        assertThat(((StubDataSource) resolved).getName()).isEqualTo("dedicated-alpha-db");
    }

    @Test
    @DisplayName("Should route to dedicated-vip-1 database pool when routing key resolver returns dedicated-vip-1")
    void shouldRouteToDedicatedVipPoolViaResolver() {
        String enterpriseTenantId = "tenant-enterprise-apex";
        when(mockKeyResolver.resolveRoutingKey(enterpriseTenantId)).thenReturn("dedicated-vip-1");

        TenantContext.setTenantId(enterpriseTenantId);

        Object lookupKey = routingDataSource.determineCurrentLookupKey();
        assertThat(lookupKey).isEqualTo("dedicated-vip-1");

        DataSource resolved = routingDataSource.determineTargetDataSource();
        assertThat(resolved).isSameAs(dedicatedVipDataSource);
        assertThat(((StubDataSource) resolved).getName()).isEqualTo("dedicated-vip-1-db");
    }

    @Test
    @DisplayName("Should fall back to default shared DataSource when routing key is null or SHARED")
    void shouldFallbackToSharedDataSourceWhenRoutingKeyNullOrShared() {
        String tenantA = "tenant-shared-a";
        String tenantB = "tenant-shared-b";

        when(mockKeyResolver.resolveRoutingKey(tenantA)).thenReturn(null);
        when(mockKeyResolver.resolveRoutingKey(tenantB)).thenReturn("SHARED");

        TenantContext.setTenantId(tenantA);
        assertThat(routingDataSource.determineCurrentLookupKey()).isEqualTo("SHARED");
        assertThat(routingDataSource.determineTargetDataSource()).isSameAs(defaultSharedDataSource);

        TenantContext.setTenantId(tenantB);
        assertThat(routingDataSource.determineCurrentLookupKey()).isEqualTo("SHARED");
        assertThat(routingDataSource.determineTargetDataSource()).isSameAs(defaultSharedDataSource);
    }

    @Test
    @DisplayName("Should fall back to default shared DataSource when tenant is not in dedicated targets")
    void shouldFallbackToSharedDataSourceForUnmappedTenant() {
        TenantContext.setTenantId("tenant-shared-beta");
        when(mockKeyResolver.resolveRoutingKey("tenant-shared-beta")).thenReturn("SHARED_DEFAULT");

        DataSource resolved = routingDataSource.determineTargetDataSource();

        assertThat(resolved).isSameAs(defaultSharedDataSource);
        assertThat(((StubDataSource) resolved).getName()).isEqualTo("shared-db");
    }

    @Test
    @DisplayName("Should fall back to default shared DataSource when TenantContext is empty/null")
    void shouldFallbackToSharedDataSourceWhenNoTenantContext() {
        TenantContext.clear();

        assertThat(routingDataSource.determineCurrentLookupKey()).isEqualTo("SHARED");

        DataSource resolved = routingDataSource.determineTargetDataSource();
        assertThat(resolved).isSameAs(defaultSharedDataSource);
        assertThat(((StubDataSource) resolved).getName()).isEqualTo("shared-db");
    }

    @Test
    @DisplayName("Should hot-load new dedicated DataSource dynamically at runtime")
    void shouldHotLoadNewDedicatedDataSourceDynamically() {
        String newTenantId = "tenant-enterprise-hotload";
        StubDataSource newDedicatedDs = new StubDataSource("hotloaded-enterprise-db");

        assertThat(routingDataSource.hasDataSource(newTenantId)).isFalse();

        // Hot-load new datasource at runtime
        routingDataSource.addDataSource(newTenantId, newDedicatedDs);

        assertThat(routingDataSource.hasDataSource(newTenantId)).isTrue();
        assertThat(routingDataSource.getCurrentTargetDataSources()).containsKey(newTenantId);

        // Test routing after hot-load
        TenantContext.setTenantId(newTenantId);
        DataSource resolved = routingDataSource.determineTargetDataSource();

        assertThat(resolved).isSameAs(newDedicatedDs);
        assertThat(((StubDataSource) resolved).getName()).isEqualTo("hotloaded-enterprise-db");
    }
}
