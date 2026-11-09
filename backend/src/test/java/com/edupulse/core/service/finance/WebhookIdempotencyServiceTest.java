package com.edupulse.core.service.finance;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebhookIdempotencyServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private WebhookIdempotencyService idempotencyService;

    @Test
    @DisplayName("isDuplicate returns false when eventId is newly recorded in Redis")
    void shouldReturnFalseForNewEvent() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(eq("edupulse:webhook:idempotency:evt_new_123"), eq("PROCESSED"), any(Duration.class)))
                .thenReturn(true);

        boolean duplicate = idempotencyService.isDuplicate("evt_new_123");

        assertThat(duplicate).isFalse();
    }

    @Test
    @DisplayName("isDuplicate returns true when eventId was already present in Redis")
    void shouldReturnTrueForDuplicateEvent() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(eq("edupulse:webhook:idempotency:evt_dup_456"), eq("PROCESSED"), any(Duration.class)))
                .thenReturn(false);

        boolean duplicate = idempotencyService.isDuplicate("evt_dup_456");

        assertThat(duplicate).isTrue();
    }

    @Test
    @DisplayName("isDuplicate returns false when eventId is null or blank")
    void shouldReturnFalseForNullOrBlankEventId() {
        assertThat(idempotencyService.isDuplicate(null)).isFalse();
        assertThat(idempotencyService.isDuplicate("")).isFalse();
        assertThat(idempotencyService.isDuplicate("   ")).isFalse();
    }

    @Test
    @DisplayName("isDuplicate handles Redis exceptions gracefully with fail-open fallback")
    void shouldFailOpenOnRedisException() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(any(), any(), any(Duration.class)))
                .thenThrow(new RuntimeException("Redis connection refused"));

        boolean duplicate = idempotencyService.isDuplicate("evt_err_789");

        assertThat(duplicate).isFalse();
    }
}
