package com.erp.multitenancy;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class TenantContextTest {

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void shouldSetAndGetTenantId() {
        TenantContext.setTenantId("tenant-alpha");
        assertEquals("tenant-alpha", TenantContext.getTenantId());
        assertEquals("tenant-alpha", TenantContext.getCurrentTenant());
    }

    @Test
    void shouldClearTenantId() {
        TenantContext.setTenantId("tenant-beta");
        assertEquals("tenant-beta", TenantContext.getTenantId());

        TenantContext.clear();
        assertNull(TenantContext.getTenantId());
        assertNull(TenantContext.getCurrentTenant());
    }

    @Test
    void shouldIsolateTenantAcrossThreads() throws InterruptedException {
        TenantContext.setTenantId("main-tenant");

        AtomicReference<String> workerTenant = new AtomicReference<>();
        CountDownLatch latch = new CountDownLatch(1);

        Thread worker = new Thread(() -> {
            workerTenant.set(TenantContext.getTenantId());
            TenantContext.setTenantId("worker-tenant");
            latch.countDown();
        });

        worker.start();
        latch.await();
        worker.join();

        assertNull(workerTenant.get(), "Worker thread should start with null tenant context");
        assertEquals("main-tenant", TenantContext.getTenantId(), "Main thread tenant should remain unaffected");
    }
}
