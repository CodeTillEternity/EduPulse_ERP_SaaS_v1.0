package com.erp.auth.controller;

import com.erp.auth.dto.AuthResponse;
import com.erp.auth.dto.ChangePasswordRequest;
import com.erp.auth.dto.ForgotPasswordRequestDTO;
import com.erp.auth.dto.LoginRequest;
import com.erp.auth.dto.RefreshTokenRequest;
import com.erp.auth.dto.ResetPasswordRequestDTO;
import com.erp.auth.dto.SessionResponse;
import com.erp.auth.entity.AppUser;
import com.erp.auth.entity.RefreshToken;
import com.erp.auth.model.Permission;
import com.erp.auth.model.UserPrincipal;
import com.erp.auth.repository.UserRepository;
import com.erp.auth.service.AuthService;
import com.erp.auth.service.PasswordResetService;
import com.erp.auth.service.RefreshTokenService;
import com.erp.common.exception.InvalidTokenException;
import com.erp.security.jwt.JwtProperties;
import com.erp.security.jwt.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/auth", "/api/auth"})
@Tag(name = "Authentication & Session", description = "Endpoints for user authentication, token refresh, logout, and session validation")
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthController(
            AuthService authService,
            RefreshTokenService refreshTokenService,
            PasswordResetService passwordResetService,
            UserRepository userRepository,
            JwtService jwtService,
            JwtProperties jwtProperties) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.passwordResetService = passwordResetService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue JWT tokens", description = "Validates credentials and generates access token in body and refresh token in HttpOnly cookie")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantHeader,
            HttpServletRequest httpRequest) {

        String effectiveTenantId = (request.tenantId() != null && !request.tenantId().isBlank())
                ? request.tenantId().trim()
                : (tenantHeader != null && !tenantHeader.isBlank() ? tenantHeader.trim() : null);

        LoginRequest scopedRequest = (effectiveTenantId != null && request.tenantId() == null)
                ? new LoginRequest(request.username(), request.password(), request.role(), effectiveTenantId)
                : request;

        String clientIp = httpRequest.getRemoteAddr();
        AuthResponse response = authService.login(scopedRequest, clientIp);

        // Generate persistent UUID-based RefreshToken for HttpOnly cookie rotation
        String refreshTokenValue = response.refreshToken();
        Optional<AppUser> userOpt = userRepository.findByUsernameIgnoreCase(response.username());
        if (userOpt.isPresent()) {
            RefreshToken entityToken = refreshTokenService.createRefreshToken(userOpt.get().getId());
            refreshTokenValue = entityToken.getToken();
        }

        ResponseCookie refreshCookie = createHttpOnlyRefreshCookie(refreshTokenValue, Duration.ofDays(7));

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token via HttpOnly cookie", description = "Validates the HttpOnly refresh token cookie, rotates it, and returns a new access token")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String cookieRefreshToken,
            @RequestBody(required = false) RefreshTokenRequest request) {

        String tokenToValidate = (cookieRefreshToken != null && !cookieRefreshToken.isBlank())
                ? cookieRefreshToken.trim()
                : (request != null ? request.refreshToken() : null);

        if (tokenToValidate == null || tokenToValidate.isBlank()) {
            throw new InvalidTokenException("Refresh token is required in HttpOnly cookie or request body");
        }

        AuthResponse authResponse;
        String newRefreshTokenValue;

        // Check if token matches UUID format (RefreshToken entity)
        Optional<RefreshToken> entityTokenOpt = refreshTokenService.findByToken(tokenToValidate);
        if (entityTokenOpt.isPresent()) {
            RefreshToken rotated = refreshTokenService.rotateRefreshToken(tokenToValidate);
            AppUser user = rotated.getUser();
            UserPrincipal principal = new UserPrincipal(
                    user.getId(),
                    user.getUsername(),
                    user.getPassword(),
                    user.getEmail(),
                    user.getRole(),
                    user.getRole().getPermissions(),
                    user.isEnabled(),
                    user.getTenantId()
            );

            String newAccessToken = jwtService.generateAccessToken(principal);
            newRefreshTokenValue = rotated.getToken();

            authResponse = new AuthResponse(
                    newAccessToken,
                    newRefreshTokenValue,
                    "Bearer",
                    jwtProperties.getAccessTokenExpiration(),
                    user.getUsername(),
                    user.getRole().name(),
                    user.getRole().getPermissions().stream().map(Permission::getValue).collect(Collectors.toSet())
            );
        } else {
            // Fallback to JWT-based refresh token handling
            authResponse = authService.refreshToken(new RefreshTokenRequest(tokenToValidate));
            newRefreshTokenValue = authResponse.refreshToken();
        }

        ResponseCookie rotatedCookie = createHttpOnlyRefreshCookie(newRefreshTokenValue, Duration.ofDays(7));

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, rotatedCookie.toString())
                .body(authResponse);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate session", description = "Revokes the active JWT token and clears the HttpOnly refresh cookie")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String bearerToken,
            @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String cookieRefreshToken,
            Authentication authentication) {

        String username = authentication != null ? authentication.getName() : null;
        authService.logout(bearerToken, username);

        if (cookieRefreshToken != null && !cookieRefreshToken.isBlank()) {
            refreshTokenService.findByToken(cookieRefreshToken)
                    .ifPresent(rt -> refreshTokenService.deleteByUserId(rt.getUser().getId()));
        }

        ResponseCookie expiredCookie = createHttpOnlyRefreshCookie("", Duration.ZERO);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredCookie.toString())
                .body(Map.of("message", "User logged out successfully. Session invalidated."));
    }

    @GetMapping("/session")
    @Operation(summary = "Validate active session", description = "Verifies active session status and token validity for current user")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<SessionResponse> validateSession(
            @RequestHeader(value = "Authorization", required = false) String bearerToken,
            Authentication authentication) {

        String username = authentication != null ? authentication.getName() : null;
        SessionResponse response = authService.validateSession(username, bearerToken);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Returns username and granted authorities from security context")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(Map.of(
                "username", auth.getName(),
                "authorities", auth.getAuthorities().stream().map(Object::toString).toList(),
                "authenticated", auth.isAuthenticated()
        ));
    }

    @PostMapping({"/change-password", "/api/v1/auth/change-password"})
    @Operation(summary = "Change authenticated user password", description = "Allows user to change their own password by verifying current credentials")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User is not authenticated"));
        }
        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully. Please use your new password on next login."));
    }

    @PostMapping({"/forgot-password", "/api/v1/auth/forgot-password"})
    @Operation(summary = "Initiate password reset with dual-factor identity verification",
               description = "Validates registered email and institutional ID before issuing a cryptographic reset token")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDTO request,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantHeader) {
        passwordResetService.processForgotPassword(request, tenantHeader);
        return ResponseEntity.ok(Map.of(
                "message", "If those details match our records, a secure password recovery link has been sent to your email."
        ));
    }

    @PostMapping({"/reset-password", "/api/v1/auth/reset-password"})
    @Operation(summary = "Complete password reset using valid cryptographic token",
               description = "Validates token validity and TTL window before updating user password hash")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDTO request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(Map.of(
                "message", "Password has been reset successfully. Please log in with your new password."
        ));
    }

    private ResponseCookie createHttpOnlyRefreshCookie(String token, Duration maxAge) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Strict")
                .build();
    }
}
