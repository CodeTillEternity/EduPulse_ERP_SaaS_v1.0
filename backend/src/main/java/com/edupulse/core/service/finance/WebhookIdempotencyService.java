package com.edupulse.core.service.finance;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Distributed Redis-backed idempotency registry for financial webhook deduplication.
 * Prevents double-processing of payment gateway webhooks using atomic Redis SETNX operations
 * with a 24-hour Time-To-Live (TTL).
 */
@Service
@Slf4j
public class WebhookIdempotencyService {

    private static final String IDEMPOTENCY_KEY_PREFIX = "edupulse:webhook:idempotency:";
    private static final Duration TTL_DURATION = Duration.ofHours(24);

    private final StringRedisTemplate redisTemplate;

    public WebhookIdempotencyService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Checks if the given webhook event ID has already been recorded in Redis.
     * Atomically registers the event ID with a 24-hour expiration if not present.
     *
     * @param eventId The unique webhook event identifier (e.g., from x-razorpay-event-id)
     * @return true if the event is a duplicate (already exists in Redis); false if newly recorded
     */
    public boolean isDuplicate(String eventId) {
        if (eventId == null || eventId.isBlank()) {
            return false;
        }

        String key = IDEMPOTENCY_KEY_PREFIX + eventId.trim();
        try {
            Boolean wasAbsent = redisTemplate.opsForValue().setIfAbsent(key, "PROCESSED", TTL_DURATION);
            boolean duplicate = !Boolean.TRUE.equals(wasAbsent);
            if (duplicate) {
                log.warn("Duplicate webhook event detected and suppressed: [eventId={}]", eventId);
            } else {
                log.debug("Registered new webhook event in idempotency registry: [eventId={}]", eventId);
            }
            return duplicate;
        } catch (Exception e) {
            log.error("Failed to check/record webhook idempotency key in Redis [{}]: {}", key, e.getMessage());
            // Fallback: Fail-open to avoid dropping genuine payment webhook events during transient cache outages
            return false;
        }
    }
}
