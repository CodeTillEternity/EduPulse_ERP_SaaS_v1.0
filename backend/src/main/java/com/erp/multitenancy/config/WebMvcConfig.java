package com.erp.multitenancy.config;

import com.erp.multitenancy.interceptor.TenantLifecycleInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final TenantLifecycleInterceptor tenantLifecycleInterceptor;

    public WebMvcConfig(TenantLifecycleInterceptor tenantLifecycleInterceptor) {
        this.tenantLifecycleInterceptor = tenantLifecycleInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tenantLifecycleInterceptor);
    }
}
