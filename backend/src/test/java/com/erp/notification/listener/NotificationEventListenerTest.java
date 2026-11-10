package com.erp.notification.listener;

import com.erp.auth.entity.AppUser;
import com.erp.auth.event.PasswordResetRequestedEvent;
import com.erp.auth.model.Role;
import com.erp.multitenancy.entity.TenantBranding;
import com.erp.multitenancy.repository.TenantBrandingRepository;
import com.erp.notification.service.NotificationService;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Optional;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class NotificationEventListenerTest {

    private JavaMailSender mailSender;
    private TenantBrandingRepository tenantBrandingRepository;
    private NotificationService notificationService;

    private NotificationEventListener listener;

    @BeforeEach
    void setUp() {
        mailSender = mock(JavaMailSender.class);
        tenantBrandingRepository = mock(TenantBrandingRepository.class);
        notificationService = mock(NotificationService.class);

        listener = new NotificationEventListener(mailSender, tenantBrandingRepository, notificationService);
    }

    @Test
    @DisplayName("Async Event: dispatches recovery email using custom tenant subdomain and JavaMailSender")
    void testHandlePasswordResetRequested_DispatchesEmailSuccessfully() {
        AppUser user = new AppUser("prof_smith", "hash", "smith@stanford.edu", Role.FACULTY, true);
        user.setId(88L);

        TenantBranding branding = new TenantBranding();
        branding.setCustomSubdomain("stanford");
        branding.setInstitutionName("Stanford University");

        when(tenantBrandingRepository.findByTenant_TenantIdIgnoreCase("stanford_tenant"))
                .thenReturn(Optional.of(branding));

        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        PasswordResetRequestedEvent event = new PasswordResetRequestedEvent(
                this, user, "sample-token-12345", "stanford_tenant"
        );

        listener.handlePasswordResetRequested(event);

        verify(mailSender, times(1)).send(mimeMessage);
        verify(notificationService, times(1)).createNotification(
                eq(88L), anyString(), anyString(), eq("SECURITY"), contains("sample-token-12345")
        );
    }

    @Test
    @DisplayName("Resilience: suppresses mail sending failures without leaking stack traces or throwing")
    void testHandlePasswordResetRequested_SuppressesMailExceptionsGracefully() {
        AppUser user = new AppUser("stu_user", "hash", "stu@dps.edu", Role.STUDENT, true);
        user.setId(99L);

        when(tenantBrandingRepository.findByTenant_TenantIdIgnoreCase("dps_tenant"))
                .thenReturn(Optional.empty());

        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailSendException("SMTP connection refused")).when(mailSender).send(any(MimeMessage.class));

        PasswordResetRequestedEvent event = new PasswordResetRequestedEvent(
                this, user, "token-fail-safe", "dps_tenant"
        );

        assertDoesNotThrow(() -> listener.handlePasswordResetRequested(event));
    }
}
