package com.erp.auth.service;

import com.edupulse.core.domain.base.TenantContext;
import com.erp.auth.entity.AppUser;
import com.erp.auth.entity.RefreshToken;
import com.erp.auth.repository.RefreshTokenRepository;
import com.erp.auth.repository.UserRepository;
import com.erp.common.exception.InvalidTokenException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

/**
 * Service managing UUID-based RefreshToken issuance, expiration validation,
 * and rotation policy (7-day lifespan) to support secure HttpOnly session renewal.
 */
@Service
@Slf4j
public class RefreshTokenService {

    private static final long REFRESH_TOKEN_VALIDITY_DAYS = 7L;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    /**
     * Issues or rotates a RefreshToken for the specified user with a 7-day expiration.
     *
     * @param userId The ID of the authenticated user
     * @return Persisted RefreshToken entity
     */
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Re-use or replace existing token to enforce single active session per user
        Optional<RefreshToken> existingOpt = refreshTokenRepository.findByUser(user);
        RefreshToken refreshToken = existingOpt.orElseGet(() -> RefreshToken.builder().user(user).build());

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plus(REFRESH_TOKEN_VALIDITY_DAYS, ChronoUnit.DAYS));

        String effectiveTenant = (user.getTenantId() != null && !user.getTenantId().isBlank())
                ? user.getTenantId()
                : (TenantContext.getTenantId() != null ? TenantContext.getTenantId() : "default");
        refreshToken.setTenantId(effectiveTenant);

        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.info("Issued 7-day refresh token for user [{}] in tenant [{}]", user.getUsername(), effectiveTenant);
        return saved;
    }

    /**
     * Finds a RefreshToken by its token string.
     */
    @Transactional(readOnly = true)
    public Optional<RefreshToken> findByToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return refreshTokenRepository.findByToken(token.trim());
    }

    /**
     * Verifies that the given token has not exceeded its 7-day expiration date.
     * If expired, removes the token record and throws an InvalidTokenException.
     *
     * @param token The RefreshToken to validate
     * @return Verified RefreshToken
     */
    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            log.warn("Expired refresh token rejected for user [{}]", token.getUser().getUsername());
            throw new InvalidTokenException("Refresh token has expired. Please log in again.");
        }
        return token;
    }

    /**
     * Rotates a refresh token: verifies the existing token, generates a new UUID,
     * resets the 7-day expiration, and saves the updated record.
     *
     * @param rawToken Existing refresh token string
     * @return Newly rotated RefreshToken
     */
    @Transactional
    public RefreshToken rotateRefreshToken(String rawToken) {
        RefreshToken refreshToken = findByToken(rawToken)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token. Please log in again."));

        verifyExpiration(refreshToken);

        // Rotate token string and renew 7-day expiration
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plus(REFRESH_TOKEN_VALIDITY_DAYS, ChronoUnit.DAYS));

        RefreshToken rotated = refreshTokenRepository.save(refreshToken);
        log.info("Successfully rotated refresh token for user [{}]", rotated.getUser().getUsername());
        return rotated;
    }

    /**
     * Revokes and removes the refresh token associated with the user ID.
     */
    @Transactional
    public void deleteByUserId(Long userId) {
        userRepository.findById(userId).ifPresent(refreshTokenRepository::deleteByUser);
    }
}
