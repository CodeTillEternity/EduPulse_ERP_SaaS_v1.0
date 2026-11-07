package com.edupulse.core.multitenancy.context;

import com.edupulse.core.domain.base.TenantContext;
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
        com.erp.multitenancy.TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        com.erp.multitenancy.TenantContext.clear();
        executor.shutdownNow();
    }

    @Test
    @DisplayName("Should propagate tenantId from parent thread to child asynchronous thread")
    void shouldPropagateTenantIdToAsyncThread() throws ExecutionException, InterruptedException, TimeoutException {
        String expectedTenantId = "tenant-async-core-999";
        TenantContext.setTenantId(expectedTenantId);

        AtomicReference<String> childThreadTenantId = new AtomicReference<>();
        CompletableFuture<Void> future = new CompletableFuture<>();

        Runnable decorated = decorator.decorate(() -> {
            childThreadTenantId.set(TenantContext.getTenantId());
            future.complete(null);
        });

        executor.submit(decorated);
        future.get(5, TimeUnit.SECONDS);

        assertThat(childThreadTenantId.get())
                .as("Child asynchronous thread must inherit the active tenantId from the caller thread")
                .isEqualTo(expectedTenantId);

        // Caller thread's context must remain completely intact
        assertThat(TenantContext.getTenantId()).isEqualTo(expectedTenantId);
    }

    @Test
    @DisplayName("Should clear tenant context in child thread after task completion to prevent pool pollution")
    void shouldClearTenantContextAfterExecution() throws ExecutionException, InterruptedException, TimeoutException {
        TenantContext.setTenantId("tenant-transient-core");

        CompletableFuture<Void> firstTaskFuture = new CompletableFuture<>();
        Runnable decorated = decorator.decorate(() -> firstTaskFuture.complete(null));

        executor.submit(decorated);
        firstTaskFuture.get(5, TimeUnit.SECONDS);

        // Run an undecorated task on the exact same worker thread
        AtomicReference<String> subsequentTaskTenantId = new AtomicReference<>();
        CompletableFuture<Void> secondTaskFuture = new CompletableFuture<>();

        executor.submit(() -> {
            subsequentTaskTenantId.set(TenantContext.getTenantId());
            secondTaskFuture.complete(null);
        });

        secondTaskFuture.get(5, TimeUnit.SECONDS);

        assertThat(subsequentTaskTenantId.get())
                .as("Reused thread pool worker must have its ThreadLocal TenantContext cleared")
                .isNull();
    }

    @Test
    @DisplayName("Should gracefully handle absence of tenant context in caller thread")
    void shouldHandleNullTenantIdGracefully() throws ExecutionException, InterruptedException, TimeoutException {
        TenantContext.clear();

        AtomicReference<String> childThreadTenantId = new AtomicReference<>();
        CompletableFuture<Void> future = new CompletableFuture<>();

        Runnable decorated = decorator.decorate(() -> {
            childThreadTenantId.set(TenantContext.getTenantId());
            future.complete(null);
        });

        executor.submit(decorated);
        future.get(5, TimeUnit.SECONDS);

        assertThat(childThreadTenantId.get()).isNull();
    }
}

