package com.erp.config;

import com.erp.multitenancy.async.TenantAwareTaskDecorator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Asynchronous task configuration enabling Spring @Async support with multi-tenant context propagation.
 * Configures ThreadPoolTaskExecutor with TenantAwareTaskDecorator to preserve tenant scope in worker threads.
 */
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    private final TenantAwareTaskDecorator tenantAwareTaskDecorator;

    public AsyncConfig(TenantAwareTaskDecorator tenantAwareTaskDecorator) {
        this.tenantAwareTaskDecorator = tenantAwareTaskDecorator;
    }

    @Override
    @Bean(name = "taskExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("saas-async-");
        executor.setTaskDecorator(tenantAwareTaskDecorator);
        executor.initialize();
        return executor;
    }
}
