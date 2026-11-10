package com.erp.auth.service;

import com.erp.auth.dto.ForgotPasswordRequestDTO;
import com.erp.auth.dto.ResetPasswordRequestDTO;

public interface PasswordResetService {

    /**
     * Initiates a password reset process with dual-factor identity verification.
     * Verifies that the provided registered email and institutional ID map to the exact same user.
     * Generates a 15-minute cryptographically secure reset token if identity matches;
     * returns silently otherwise to prevent account enumeration.
     *
     * @param request  Forgot password payload containing email and institutionalId
     * @param tenantId Multi-tenant identifier
     */
    void processForgotPassword(ForgotPasswordRequestDTO request, String tenantId);

    /**
     * Resets user password using a verified token within its 15-minute TTL window.
     * Updates the password BCrypt hash and immediately invalidates the consumed token.
     *
     * @param request Reset password payload containing token and new password
     */
    void resetPassword(ResetPasswordRequestDTO request);
}
