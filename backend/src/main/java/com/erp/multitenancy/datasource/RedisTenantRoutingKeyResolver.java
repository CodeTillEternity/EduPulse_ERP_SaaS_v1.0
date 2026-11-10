package com.erp.multitenancy.datasource;

import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service resolving database routing keys for tenants.
 * Queries TenantRegistry with multi-tier caching (Redis + local in-memory fallback)
 * to ensure high-performance, low-latency dynamic routing on every database query.
 */
@Service
public class RedisTenantRoutingKeyResolver implements TenantRoutingKeyResolver {

    private static final Logger log = LoggerFactory.getLogger(RedisTenantRoutingKeyResolver.class);
    private static final String REDIS_PREFIX = "tenant:routing:";
    public static final String DEFAULT_SHARED_KEY = "SHARED";

    private final TenantRegistryRepository tenantRegistryRepository;
    private final StringRedisTemplate redisTemplate;
    private final Map<String, String> localMemoryCache = new ConcurrentHashMap<>();

    @Autowired
    public RedisTenantRoutingKeyResolver(@Lazy TenantRegistryRepository tenantRegistryRepository,
                                         @Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.redisTemplate = redisTemplate;
    }

    @Override
    @Cacheable(value = "tenantRouting", key = "#tenantId", unless = "#result == null")
    public String resolveRoutingKey(String tenantId) {
        if (tenantId == null || tenantId.isBlank() || "default".equalsIgnoreCase(tenantId)) {
            return DEFAULT_SHARED_KEY;
        }

        // 1. Check local cache
        if (localMemoryCache.containsKey(tenantId)) {
            return localMemoryCache.get(tenantId);
        }

        // 2. Check Redis cache
        if (redisTemplate != null) {
            try {
                String cachedKey = redisTemplate.opsForValue().get(REDIS_PREFIX + tenantId);
                if (cachedKey != null && !cachedKey.isBlank()) {
                    localMemoryCache.put(tenantId, cachedKey);
                    return cachedKey;
                }
            } catch (Exception ex) {
                log.debug("Redis routing cache read skipped: {}", ex.getMessage());
            }
        }

        // 3. Fallback to Central Tenant Registry
        String routingKey = DEFAULT_SHARED_KEY;
        if (tenantRegistryRepository != null) {
            try {
                Optional<TenantRegistry> tenantOpt = tenantRegistryRepository.findById(tenantId);
                if (tenantOpt.isPresent()) {
                    TenantRegistry tr = tenantOpt.get();
                    if (tr.getDatabaseRoutingKey() != null && !tr.getDatabaseRoutingKey().isBlank()) {
                        routingKey = tr.getDatabaseRoutingKey();
                    } else if (tr.getDatabaseMode() != null && !tr.getDatabaseMode().isBlank()) {
                        routingKey = tr.getDatabaseMode();
                    }
                }
            } catch (Exception ex) {
                log.warn("Error reading databaseRoutingKey from TenantRegistry for [{}]: {}", tenantId, ex.getMessage());
            }
        }

        // 4. Update caches
        localMemoryCache.put(tenantId, routingKey);
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(REDIS_PREFIX + tenantId, routingKey, Duration.ofHours(1));
            } catch (Exception ex) {
                log.debug("Redis routing cache write skipped: {}", ex.getMessage());
            }
        }

        return routingKey;
    }

    @Override
    @CacheEvict(value = "tenantRouting", key = "#tenantId")
    public void evictRoutingKey(String tenantId) {
        if (tenantId == null) return;
        localMemoryCache.remove(tenantId);
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(REDIS_PREFIX + tenantId);
            } catch (Exception ex) {
                log.debug("Redis routing cache evict skipped: {}", ex.getMessage());
            }
        }
    }

    @Override
    public void updateRoutingKey(String tenantId, String routingKey) {
        if (tenantId == null) return;
        String keyToStore = (routingKey != null && !routingKey.isBlank()) ? routingKey : DEFAULT_SHARED_KEY;
        localMemoryCache.put(tenantId, keyToStore);
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(REDIS_PREFIX + tenantId, keyToStore, Duration.ofHours(1));
            } catch (Exception ex) {
                log.debug("Redis routing cache update skipped: {}", ex.getMessage());
            }
        }
    }
}

