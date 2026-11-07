package com.erp.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.task.TaskDecorator;
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

    private final TaskDecorator tenantAwareTaskDecorator;

    public AsyncConfig(@Qualifier("coreTenantAwareTaskDecorator") TaskDecorator tenantAwareTaskDecorator) {
        this.tenantAwareTaskDecorator = tenantAwareTaskDecorator;
    }

    @Override
    @Bean(name = "taskExecutor")
    @Primary
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
