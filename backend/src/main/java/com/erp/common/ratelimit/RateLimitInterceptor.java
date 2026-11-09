package com.erp.common.ratelimit;

import com.erp.multitenancy.TenantContext;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * High-performance API Rate Limiting Interceptor backed by Bucket4j and Redis.
 * Enforces:
 *  - 100 requests per minute per IP address for public endpoints (e.g. /api/auth/login)
 *  - 300 requests per minute per tenantId for authenticated endpoints
 * Emits strict HTTP 429 Too Many Requests with Retry-After header on limit breach.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);

    public static final int PUBLIC_RPM_LIMIT = 100;
    public static final int AUTHENTICATED_RPM_LIMIT = 300;

    private final RedisConnectionFactory redisConnectionFactory;
    private LettuceBasedProxyManager<byte[]> proxyManager;

    // Resilient in-memory fallback for local development / testing without active Redis instance
    private final Map<String, Bucket> inMemoryBuckets = new ConcurrentHashMap<>();

    private final BucketConfiguration publicBucketConfiguration;
    private final BucketConfiguration authenticatedBucketConfiguration;

    @Autowired
    public RateLimitInterceptor(@Autowired(required = false) RedisConnectionFactory redisConnectionFactory) {
        this.redisConnectionFactory = redisConnectionFactory;

        Bandwidth publicLimit = Bandwidth.builder()
                .capacity(PUBLIC_RPM_LIMIT)
                .refillGreedy(PUBLIC_RPM_LIMIT, Duration.ofMinutes(1))
                .build();
        this.publicBucketConfiguration = BucketConfiguration.builder().addLimit(publicLimit).build();

        Bandwidth authLimit = Bandwidth.builder()
                .capacity(AUTHENTICATED_RPM_LIMIT)
                .refillGreedy(AUTHENTICATED_RPM_LIMIT, Duration.ofMinutes(1))
                .build();
        this.authenticatedBucketConfiguration = BucketConfiguration.builder().addLimit(authLimit).build();
    }

    public RateLimitInterceptor() {
        this(null);
    }

    @PostConstruct
    public void init() {
        if (redisConnectionFactory instanceof LettuceConnectionFactory lettuceFactory) {
            try {
                Object nativeClient = lettuceFactory.getNativeClient();
                if (nativeClient instanceof io.lettuce.core.RedisClient redisClient) {
                    this.proxyManager = LettuceBasedProxyManager.builderFor(redisClient).build();
                    log.info("Initialized Redis-backed Bucket4j Token Bucket rate limiter via Lettuce");
                }
            } catch (Exception ex) {
                log.warn("Could not bind RedisClient for Bucket4j: {}. Running with in-memory token buckets.", ex.getMessage());
            }
        }
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        boolean isPublic = isPublicEndpoint(path);

        String rateLimitKey;
        if (isPublic) {
            String clientIp = resolveClientIp(request);
            rateLimitKey = "rate_limit:ip:" + clientIp;
        } else {
            String tenantId = resolveTenantId(request);
            if (tenantId != null && !tenantId.isBlank()) {
                rateLimitKey = "rate_limit:tenant:" + tenantId.trim().toLowerCase();
            } else {
                rateLimitKey = "rate_limit:ip:" + resolveClientIp(request);
            }
        }

        Bucket bucket = resolveBucket(rateLimitKey, isPublic);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            return true;
        } else {
            long waitForRefillNanos = probe.getNanosToWaitForRefill();
            long retryAfterSeconds = Math.max(1, TimeUnit.NANOSECONDS.toSeconds(waitForRefillNanos));
            sendRateLimitExceededResponse(response, path, retryAfterSeconds);
            return false;
        }
    }

    public Bucket resolveBucket(String key, boolean isPublic) {
        Supplier<BucketConfiguration> configSupplier = isPublic
                ? () -> publicBucketConfiguration
                : () -> authenticatedBucketConfiguration;

        if (proxyManager != null) {
            try {
                byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
                return proxyManager.builder().build(keyBytes, configSupplier);
            } catch (Exception ex) {
                log.warn("Redis rate-limiting error for key [{}]: {}. Falling back to in-memory bucket.", key, ex.getMessage());
            }
        }

        int capacity = isPublic ? PUBLIC_RPM_LIMIT : AUTHENTICATED_RPM_LIMIT;
        return inMemoryBuckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(capacity)
                        .refillGreedy(capacity, Duration.ofMinutes(1))
                        .build())
                .build());
    }

    private boolean isPublicEndpoint(String path) {
        if (path == null) {
            return false;
        }
        return path.startsWith("/api/auth/")
                || path.startsWith("/api/public/")
                || path.startsWith("/actuator/")
                || path.equals("/error");
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return (remoteAddr != null && !remoteAddr.isBlank()) ? remoteAddr : "127.0.0.1";
    }

    private String resolveTenantId(HttpServletRequest request) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId != null && !tenantId.isBlank()) {
            return tenantId;
        }
        String coreTenant = com.edupulse.core.domain.base.TenantContext.getTenantId();
        if (coreTenant != null && !coreTenant.isBlank()) {
            return coreTenant;
        }
        String headerTenant = request.getHeader("X-Tenant-ID");
        if (headerTenant != null && !headerTenant.isBlank()) {
            return headerTenant;
        }
        return null;
    }

    private void sendRateLimitExceededResponse(HttpServletResponse response, String path, long retryAfterSeconds) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.setContentType("application/problem+json");
        response.setCharacterEncoding("UTF-8");

        String payload = String.format("""
                {
                  "type": "https://api.edupulse.com/errors/too_many_requests",
                  "title": "Too Many Requests",
                  "status": 429,
                  "detail": "Rate limit exceeded. Please retry after %d seconds.",
                  "path": "%s",
                  "retryAfterSeconds": %d,
                  "timestamp": "%s"
                }""",
                retryAfterSeconds,
                path != null ? path : "/api",
                retryAfterSeconds,
                Instant.now().toString()
        );

        response.getWriter().write(payload);
        response.getWriter().flush();
    }

    public void clearLocalBuckets() {
        inMemoryBuckets.clear();
    }
}
