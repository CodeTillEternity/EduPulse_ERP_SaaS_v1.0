package com.erp.multitenancy;

import org.hibernate.cfg.AvailableSettings;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class TenantIdentifierResolverTest {

    private TenantIdentifierResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new TenantIdentifierResolver();
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void shouldResolveTenantIdFromTenantContext() {
        TenantContext.setTenantId("university-42");
        assertEquals("university-42", resolver.resolveCurrentTenantIdentifier());
    }

    @Test
    void shouldFallbackToDefaultTenantWhenContextIsEmpty() {
        assertNull(TenantContext.getTenantId());
        assertEquals(TenantIdentifierResolver.DEFAULT_TENANT_ID, resolver.resolveCurrentTenantIdentifier());
    }

    @Test
    void shouldFallbackToDefaultTenantWhenContextIsBlank() {
        TenantContext.setTenantId("   ");
        assertEquals(TenantIdentifierResolver.DEFAULT_TENANT_ID, resolver.resolveCurrentTenantIdentifier());
    }

    @Test
    void shouldValidateExistingCurrentSessions() {
        assertTrue(resolver.validateExistingCurrentSessions());
    }

    @Test
    void shouldCustomizeHibernateProperties() {
        Map<String, Object> props = new HashMap<>();
        resolver.customize(props);
        assertSame(resolver, props.get(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER));
    }
}
