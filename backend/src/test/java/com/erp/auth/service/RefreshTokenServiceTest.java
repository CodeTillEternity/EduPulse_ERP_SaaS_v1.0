package com.erp.auth.service;

import com.erp.auth.entity.AppUser;
import com.erp.auth.entity.RefreshToken;
import com.erp.auth.model.Role;
import com.erp.auth.repository.RefreshTokenRepository;
import com.erp.auth.repository.UserRepository;
import com.erp.common.exception.InvalidTokenException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @Test
    @DisplayName("createRefreshToken generates UUID token with 7-day expiration")
    void shouldCreateRefreshTokenSuccessfully() {
        AppUser user = new AppUser("testuser", "encoded_pass", "user@test.com", Role.FACULTY, true);
        user.setId(10L);
        user.setTenantId("tenant-cambridge");

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(refreshTokenRepository.findByUser(user)).thenReturn(Optional.empty());
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RefreshToken token = refreshTokenService.createRefreshToken(10L);

        assertThat(token.getToken()).isNotNull();
        assertThat(token.getToken()).contains("-"); // UUID format
        assertThat(token.getExpiryDate()).isAfter(Instant.now().plus(6, ChronoUnit.DAYS));
        assertThat(token.getUser()).isEqualTo(user);
        assertThat(token.getTenantId()).isEqualTo("tenant-cambridge");
    }

    @Test
    @DisplayName("verifyExpiration throws InvalidTokenException when token is expired")
    void shouldThrowExceptionWhenTokenExpired() {
        AppUser user = new AppUser("testuser", "encoded_pass", "user@test.com", Role.STUDENT, true);
        RefreshToken expiredToken = RefreshToken.builder()
                .token("uuid-mock-expired")
                .expiryDate(Instant.now().minus(1, ChronoUnit.DAYS))
                .user(user)
                .build();

        assertThatThrownBy(() -> refreshTokenService.verifyExpiration(expiredToken))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("expired");

        verify(refreshTokenRepository).delete(expiredToken);
    }

    @Test
    @DisplayName("rotateRefreshToken rotates UUID and extends expiration date")
    void shouldRotateRefreshTokenSuccessfully() {
        AppUser user = new AppUser("testuser", "encoded_pass", "user@test.com", Role.ADMIN, true);
        RefreshToken activeToken = RefreshToken.builder()
                .token("original-uuid-1111")
                .expiryDate(Instant.now().plus(3, ChronoUnit.DAYS))
                .user(user)
                .build();

        when(refreshTokenRepository.findByToken("original-uuid-1111")).thenReturn(Optional.of(activeToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RefreshToken rotated = refreshTokenService.rotateRefreshToken("original-uuid-1111");

        assertThat(rotated.getToken()).isNotEqualTo("original-uuid-1111");
        assertThat(rotated.getExpiryDate()).isAfter(Instant.now().plus(6, ChronoUnit.DAYS));
    }
}
