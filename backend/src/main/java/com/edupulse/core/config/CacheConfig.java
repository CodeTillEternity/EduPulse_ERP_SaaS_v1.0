package com.edupulse.core.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Cache fallback configuration activating in-memory caching support if RedisCacheManager is not provided.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    @ConditionalOnMissingBean(name = "cacheManager")
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("students");
    }
}

