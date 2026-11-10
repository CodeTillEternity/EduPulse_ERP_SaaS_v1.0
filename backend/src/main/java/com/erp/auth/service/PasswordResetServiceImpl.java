package com.erp.auth.service;

import com.erp.auth.dto.ForgotPasswordRequestDTO;
import com.erp.auth.dto.ResetPasswordRequestDTO;
import com.erp.auth.entity.AppUser;
import com.erp.auth.entity.PasswordResetToken;
import com.erp.auth.repository.PasswordResetTokenRepository;
import com.erp.auth.repository.UserRepository;
import com.erp.common.exception.InvalidTokenException;
import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetServiceImpl.class);
    private static final Duration TOKEN_TTL = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    public PasswordResetServiceImpl(
            UserRepository userRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public void processForgotPassword(ForgotPasswordRequestDTO request, String tenantId) {
        if (request == null || request.getEmail() == null || request.getInstitutionalId() == null) {
            return;
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String institutionalId = request.getInstitutionalId().trim();

        // Step 1: Look up user by registered email
        Optional<AppUser> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (userOpt.isEmpty()) {
            log.info("Password reset requested for non-existent email: [PROTECTED]");
            return; // Generic success abstraction to prevent user enumeration
        }

        AppUser user = userOpt.get();

        // Step 2: Dual-Factor Identity Verification
        boolean identityVerified = verifyInstitutionalIdentity(user, normalizedEmail, institutionalId);
        if (!identityVerified) {
            log.warn("Dual-factor identity check failed for user ID {} with email [PROTECTED]", user.getId());
            return; // Generic success abstraction: do not issue token if dual-factor fails
        }

        // Step 3: Revoke any existing active reset tokens for this user
        passwordResetTokenRepository.deleteByUserId(user.getId());
        passwordResetTokenRepository.flush();

        // Step 4: Generate new cryptographic token with 15-minute TTL
        String tokenValue = UUID.randomUUID().toString();
        Instant expiryInstant = Instant.now().plus(TOKEN_TTL);

        String effectiveTenantId = (tenantId != null && !tenantId.isBlank())
                ? tenantId.trim()
                : (user.getTenantId() != null && !user.getTenantId().isBlank() ? user.getTenantId() : "default");

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(tokenValue)
                .expiryDate(expiryInstant)
                .user(user)
                .build();
        resetToken.setTenantId(effectiveTenantId);

        passwordResetTokenRepository.save(resetToken);
        log.info("Generated password reset token for verified user ID {} (TTL: 15 mins)", user.getId());

        // Publish event for asynchronous notification delivery (Commit 167)
        try {
            Class<?> eventClass = Class.forName("com.erp.auth.event.PasswordResetRequestedEvent");
            Object event = eventClass.getConstructor(Object.class, AppUser.class, String.class, String.class)
                    .newInstance(this, user, tokenValue, effectiveTenantId);
            eventPublisher.publishEvent(event);
        } catch (ClassNotFoundException ignored) {
            // Event class will be introduced in Task 2
        } catch (Exception e) {
            log.error("Failed to publish PasswordResetRequestedEvent: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequestDTO request) {
        if (request == null || request.getToken() == null || request.getNewPassword() == null) {
            throw new InvalidTokenException("Invalid password reset request");
        }

        String tokenValue = request.getToken().trim();
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new InvalidTokenException("Invalid or unrecognized password reset token"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new InvalidTokenException("Password reset token has expired. Please request a new recovery link.");
        }

        AppUser user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        userRepository.save(user);

        // Invalidate token immediately upon successful password reset
        passwordResetTokenRepository.delete(resetToken);
        log.info("Successfully reset password for user ID {}", user.getId());
    }

    private boolean verifyInstitutionalIdentity(AppUser user, String email, String institutionalId) {
        // 1. Direct username match (e.g. employee ID or enrollment number as username)
        if (institutionalId.equalsIgnoreCase(user.getUsername())) {
            return true;
        }

        // 2. Student Domain Check (Admission No. / Roll No. / Enrollment No. / ID)
        Optional<Student> studentOpt = studentRepository.findByUserId(user.getId());
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByEmail(email);
        }
        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            if ((s.getEnrollmentNumber() != null && institutionalId.equalsIgnoreCase(s.getEnrollmentNumber().trim()))
                    || (s.getRollNumber() != null && institutionalId.equalsIgnoreCase(s.getRollNumber().trim()))
                    || institutionalId.equals(String.valueOf(s.getId()))) {
                return true;
            }
        }

        // 3. Faculty Domain Check (Faculty ID / Official Email)
        Optional<Faculty> facultyOpt = facultyRepository.findByUserId(user.getId());
        if (facultyOpt.isEmpty()) {
            facultyOpt = facultyRepository.findByOfficialEmailIgnoreCase(email);
        }
        if (facultyOpt.isPresent()) {
            Faculty f = facultyOpt.get();
            if (institutionalId.equals(String.valueOf(f.getId()))
                    || institutionalId.equalsIgnoreCase(f.getOfficialEmail().trim())) {
                return true;
            }
        }

        // 4. Primary User ID match
        return institutionalId.equals(String.valueOf(user.getId()));
    }
}
