package com.erp.multitenancy.config;

import com.erp.common.ratelimit.RateLimitInterceptor;
import com.erp.multitenancy.interceptor.TenantLifecycleInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final TenantLifecycleInterceptor tenantLifecycleInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;

    @Autowired
    public WebMvcConfig(TenantLifecycleInterceptor tenantLifecycleInterceptor,
                        @Autowired(required = false) RateLimitInterceptor rateLimitInterceptor) {
        this.tenantLifecycleInterceptor = tenantLifecycleInterceptor;
        this.rateLimitInterceptor = rateLimitInterceptor;
    }

    public WebMvcConfig(TenantLifecycleInterceptor tenantLifecycleInterceptor) {
        this(tenantLifecycleInterceptor, null);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tenantLifecycleInterceptor);
        if (rateLimitInterceptor != null) {
            registry.addInterceptor(rateLimitInterceptor);
        }
    }
}
