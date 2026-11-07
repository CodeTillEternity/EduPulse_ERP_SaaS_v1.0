package com.erp.multitenancy.async;

import com.erp.multitenancy.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class TenantAwareTaskDecoratorTest {

    private TenantAwareTaskDecorator decorator;
    private ExecutorService executor;

    @BeforeEach
    void setUp() {
        decorator = new TenantAwareTaskDecorator();
        executor = Executors.newSingleThreadExecutor();
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        executor.shutdownNow();
    }

    @Test
    @DisplayName("Should propagate tenantId from parent thread to child asynchronous thread")
    void shouldPropagateTenantIdToAsyncThread() throws ExecutionException, InterruptedException, TimeoutException {
        String expectedTenantId = "tenant-async-12345";
        TenantContext.setTenantId(expectedTenantId);

        AtomicReference<String> asyncTenantId = new AtomicReference<>();
        CompletableFuture<Void> future = new CompletableFuture<>();

        Runnable decorated = decorator.decorate(() -> {
            asyncTenantId.set(TenantContext.getTenantId());
            future.complete(null);
        });

        executor.submit(decorated);
        future.get(5, TimeUnit.SECONDS);

        assertThat(asyncTenantId.get())
                .as("Async thread must receive the tenant_id captured from the caller thread")
                .isEqualTo(expectedTenantId);

        // Verify main thread's TenantContext remains unchanged
        assertThat(TenantContext.getTenantId()).isEqualTo(expectedTenantId);
    }

    @Test
    @DisplayName("Should clear tenant context after child thread execution completes")
    void shouldClearTenantContextAfterExecution() throws ExecutionException, InterruptedException, TimeoutException {
        TenantContext.setTenantId("tenant-transient-999");

        CompletableFuture<Void> firstTaskFuture = new CompletableFuture<>();
        Runnable decorated = decorator.decorate(() -> firstTaskFuture.complete(null));

        executor.submit(decorated);
        firstTaskFuture.get(5, TimeUnit.SECONDS);

        // Subsequent task on the same pooled thread without decoration should see empty TenantContext
        AtomicReference<String> secondTaskTenantId = new AtomicReference<>();
        CompletableFuture<Void> secondTaskFuture = new CompletableFuture<>();

        executor.submit(() -> {
            secondTaskTenantId.set(TenantContext.getTenantId());
            secondTaskFuture.complete(null);
        });

        secondTaskFuture.get(5, TimeUnit.SECONDS);

        assertThat(secondTaskTenantId.get())
                .as("Worker thread must have its TenantContext cleared to prevent thread leak")
                .isNull();
    }

    @Test
    @DisplayName("Should handle null tenantId in caller thread gracefully")
    void shouldHandleNullTenantIdGracefully() throws ExecutionException, InterruptedException, TimeoutException {
        TenantContext.clear();

        AtomicReference<String> asyncTenantId = new AtomicReference<>();
        CompletableFuture<Void> future = new CompletableFuture<>();

        Runnable decorated = decorator.decorate(() -> {
            asyncTenantId.set(TenantContext.getTenantId());
            future.complete(null);
        });

        executor.submit(decorated);
        future.get(5, TimeUnit.SECONDS);

        assertThat(asyncTenantId.get()).isNull();
    }
}
