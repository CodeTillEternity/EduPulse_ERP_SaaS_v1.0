package com.erp.auth.service;

import com.erp.auth.dto.ForgotPasswordRequestDTO;
import com.erp.auth.dto.ResetPasswordRequestDTO;
import com.erp.auth.entity.AppUser;
import com.erp.auth.entity.PasswordResetToken;
import com.erp.auth.model.Role;
import com.erp.auth.repository.PasswordResetTokenRepository;
import com.erp.auth.repository.UserRepository;
import com.erp.common.exception.InvalidTokenException;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PasswordResetServiceTest {

    private UserRepository userRepository;
    private StudentRepository studentRepository;
    private FacultyRepository facultyRepository;
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private PasswordEncoder passwordEncoder;
    private ApplicationEventPublisher eventPublisher;

    private PasswordResetServiceImpl passwordResetService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        studentRepository = mock(StudentRepository.class);
        facultyRepository = mock(FacultyRepository.class);
        passwordResetTokenRepository = mock(PasswordResetTokenRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        eventPublisher = mock(ApplicationEventPublisher.class);

        passwordResetService = new PasswordResetServiceImpl(
                userRepository,
                studentRepository,
                facultyRepository,
                passwordResetTokenRepository,
                passwordEncoder,
                eventPublisher
        );
    }

    @Test
    @DisplayName("Dual-Factor: valid email and matching student enrollment ID generates a 15-min token")
    void testForgotPassword_ValidStudent_GeneratesToken() {
        AppUser user = new AppUser("stu_1001", "old_hash", "john.doe@edupulse.edu", Role.STUDENT, true);
        user.setId(42L);
        user.setTenantId("stanford");

        Student student = new Student();
        student.setId(10L);
        student.setUserId(42L);
        student.setEnrollmentNumber("ENR-2026-42");
        student.setEmail("john.doe@edupulse.edu");

        when(userRepository.findByEmailIgnoreCase("john.doe@edupulse.edu")).thenReturn(Optional.of(user));
        when(studentRepository.findByUserId(42L)).thenReturn(Optional.of(student));

        ForgotPasswordRequestDTO request = ForgotPasswordRequestDTO.builder()
                .email("john.doe@edupulse.edu")
                .institutionalId("ENR-2026-42")
                .build();

        passwordResetService.processForgotPassword(request, "stanford");

        verify(passwordResetTokenRepository, times(1)).deleteByUserId(42L);

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository, times(1)).save(tokenCaptor.capture());

        PasswordResetToken savedToken = tokenCaptor.getValue();
        assertNotNull(savedToken.getToken());
        assertEquals(user, savedToken.getUser());
        assertEquals("stanford", savedToken.getTenantId());
        assertTrue(savedToken.getExpiryDate().isAfter(Instant.now()));
        assertTrue(savedToken.getExpiryDate().isBefore(Instant.now().plus(Duration.ofMinutes(16))));
    }

    @Test
    @DisplayName("Dual-Factor Anti-Enumeration: invalid institutional ID returns silently without issuing token")
    void testForgotPassword_MismatchedInstitutionalId_DoesNotGenerateToken() {
        AppUser user = new AppUser("stu_1001", "old_hash", "john.doe@edupulse.edu", Role.STUDENT, true);
        user.setId(42L);

        Student student = new Student();
        student.setId(10L);
        student.setUserId(42L);
        student.setEnrollmentNumber("ENR-2026-42");

        when(userRepository.findByEmailIgnoreCase("john.doe@edupulse.edu")).thenReturn(Optional.of(user));
        when(studentRepository.findByUserId(42L)).thenReturn(Optional.of(student));
        when(facultyRepository.findByUserId(42L)).thenReturn(Optional.empty());

        ForgotPasswordRequestDTO request = ForgotPasswordRequestDTO.builder()
                .email("john.doe@edupulse.edu")
                .institutionalId("ATTACKER_GUESS_9999")
                .build();

        passwordResetService.processForgotPassword(request, "stanford");

        verify(passwordResetTokenRepository, never()).save(any());
        verify(passwordResetTokenRepository, never()).deleteByUserId(any());
    }

    @Test
    @DisplayName("Anti-Enumeration: non-existent email returns silently without throwing or issuing token")
    void testForgotPassword_NonExistentEmail_ReturnsSilently() {
        when(userRepository.findByEmailIgnoreCase("unknown@edupulse.edu")).thenReturn(Optional.empty());

        ForgotPasswordRequestDTO request = ForgotPasswordRequestDTO.builder()
                .email("unknown@edupulse.edu")
                .institutionalId("ID-12345")
                .build();

        assertDoesNotThrow(() -> passwordResetService.processForgotPassword(request, "stanford"));
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("Reset Password: valid token updates password hash and consumes token")
    void testResetPassword_ValidToken_Success() {
        AppUser user = new AppUser("stu_1001", "old_hash", "john.doe@edupulse.edu", Role.STUDENT, true);
        PasswordResetToken token = PasswordResetToken.builder()
                .token("valid-uuid-token")
                .expiryDate(Instant.now().plus(Duration.ofMinutes(10)))
                .user(user)
                .build();

        when(passwordResetTokenRepository.findByToken("valid-uuid-token")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("Secret@12345")).thenReturn("new_bcrypt_hash");

        ResetPasswordRequestDTO request = ResetPasswordRequestDTO.builder()
                .token("valid-uuid-token")
                .newPassword("Secret@12345")
                .build();

        passwordResetService.resetPassword(request);

        assertEquals("new_bcrypt_hash", user.getPassword());
        verify(userRepository, times(1)).save(user);
        verify(passwordResetTokenRepository, times(1)).delete(token);
    }

    @Test
    @DisplayName("Reset Password: expired token throws InvalidTokenException and removes expired token")
    void testResetPassword_ExpiredToken_ThrowsInvalidTokenException() {
        AppUser user = new AppUser("stu_1001", "old_hash", "john.doe@edupulse.edu", Role.STUDENT, true);
        PasswordResetToken expiredToken = PasswordResetToken.builder()
                .token("expired-token")
                .expiryDate(Instant.now().minus(Duration.ofMinutes(1)))
                .user(user)
                .build();

        when(passwordResetTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(expiredToken));

        ResetPasswordRequestDTO request = ResetPasswordRequestDTO.builder()
                .token("expired-token")
                .newPassword("Secret@12345")
                .build();

        assertThrows(InvalidTokenException.class, () -> passwordResetService.resetPassword(request));
        verify(passwordResetTokenRepository, times(1)).delete(expiredToken);
        verify(userRepository, never()).save(any());
    }
}
