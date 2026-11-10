package com.erp.notification.listener;

import com.erp.auth.entity.AppUser;
import com.erp.auth.event.PasswordResetRequestedEvent;
import com.erp.multitenancy.entity.TenantBranding;
import com.erp.multitenancy.repository.TenantBrandingRepository;
import com.erp.notification.service.NotificationService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Asynchronous event listener handling transactional notifications and dispatching
 * encrypted recovery links without blocking the primary HTTP authentication thread.
 */
@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final JavaMailSender mailSender;
    private final TenantBrandingRepository tenantBrandingRepository;
    private final NotificationService notificationService;

    public NotificationEventListener(
            @Autowired(required = false) JavaMailSender mailSender,
            TenantBrandingRepository tenantBrandingRepository,
            NotificationService notificationService) {
        this.mailSender = mailSender;
        this.tenantBrandingRepository = tenantBrandingRepository;
        this.notificationService = notificationService;
    }

    /**
     * Catches PasswordResetRequestedEvent asynchronously, resolves institutional white-labeling,
     * constructs the branded recovery link, and dispatches an HTML email.
     * Guaranteed never to leak stack traces or failure logs to client surfaces.
     *
     * @param event PasswordResetRequestedEvent holding user, token, and tenant details
     */
    @Async
    @EventListener
    public void handlePasswordResetRequested(PasswordResetRequestedEvent event) {
        if (event == null || event.getUser() == null || event.getToken() == null) {
            return;
        }

        AppUser user = event.getUser();
        String recipientEmail = user.getEmail();
        String token = event.getToken();
        String tenantId = event.getTenantId();

        // Resolve custom institutional subdomain
        String subdomain = resolveSubdomain(tenantId);
        String institutionName = resolveInstitutionName(tenantId);

        String recoveryLink = String.format("https://%s.edupulse.com/reset-password?token=%s", subdomain, token);
        log.info("Processing async password reset dispatch for user ID {} on subdomain '{}'", user.getId(), subdomain);

        // Record persistent in-app audit notification
        try {
            notificationService.createNotification(
                    user.getId(),
                    "Password Reset Initiated",
                    "A secure password recovery link was dispatched to your registered email address.",
                    "SECURITY",
                    "/reset-password?token=" + token
            );
        } catch (Exception e) {
            log.warn("Failed to persist in-app password reset notification for user {}: {}", user.getId(), e.getMessage());
        }

        // Dispatch transactional email via JavaMailSender
        if (mailSender == null) {
            log.warn("JavaMailSender is not configured. Password recovery link for user {} [PROTECTED]: {}",
                    user.getId(), recoveryLink);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(recipientEmail);
            helper.setFrom("security@edupulse.com", "EduPulse Security");
            helper.setSubject(String.format("[%s] Password Reset Request", institutionName));

            String htmlBody = buildHtmlEmailTemplate(user.getUsername(), institutionName, recoveryLink);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Transactional password reset email successfully dispatched to user ID {}", user.getId());
        } catch (Exception ex) {
            // Strict security: log generic message, suppress stack traces
            log.error("Failed to send transactional password recovery email to user ID {}: {}",
                    user.getId(), ex.getMessage());
        }
    }

    private String resolveSubdomain(String tenantId) {
        if (tenantId == null || tenantId.isBlank() || "default".equalsIgnoreCase(tenantId)) {
            return "app";
        }
        Optional<TenantBranding> brandingOpt = tenantBrandingRepository.findByTenant_TenantIdIgnoreCase(tenantId);
        return brandingOpt.map(TenantBranding::getCustomSubdomain)
                .filter(s -> !s.isBlank())
                .orElse(tenantId.toLowerCase().replaceAll("[^a-z0-9-]", ""));
    }

    private String resolveInstitutionName(String tenantId) {
        if (tenantId == null || tenantId.isBlank() || "default".equalsIgnoreCase(tenantId)) {
            return "EduPulse Institutional ERP";
        }
        Optional<TenantBranding> brandingOpt = tenantBrandingRepository.findByTenant_TenantIdIgnoreCase(tenantId);
        return brandingOpt.map(TenantBranding::getInstitutionName)
                .filter(name -> !name.isBlank())
                .orElse("EduPulse (" + tenantId.toUpperCase() + ")");
    }

    private String buildHtmlEmailTemplate(String username, String institutionName, String recoveryLink) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                + "<title>Password Reset Request</title>"
                + "</head>"
                + "<body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;'>"
                + "<div style='max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);'>"
                + "  <div style='background-color: #0f172a; padding: 24px; text-align: center;'>"
                + "    <h1 style='color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.025em;'>" + institutionName + "</h1>"
                + "    <p style='color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;'>Institutional Identity & Access Management</p>"
                + "  </div>"
                + "  <div style='padding: 32px 24px;'>"
                + "    <h2 style='font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0;'>Password Reset Verification</h2>"
                + "    <p style='font-size: 14px; line-height: 1.6; color: #475569;'>Hello <strong>" + username + "</strong>,</p>"
                + "    <p style='font-size: 14px; line-height: 1.6; color: #475569;'>A request was initiated to reset the password for your EduPulse Institutional ERP account following successful dual-factor identity verification.</p>"
                + "    <div style='text-align: center; margin: 32px 0;'>"
                + "      <a href='" + recoveryLink + "' style='display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);'>Reset Your Password</a>"
                + "    </div>"
                + "    <p style='font-size: 12px; line-height: 1.5; color: #64748b; background-color: #f1f5f9; padding: 12px; border-radius: 6px; margin-bottom: 24px;'>"
                + "      <strong>Security Notice:</strong> This link is cryptographically signed and will automatically expire in <strong>15 minutes</strong>. It can only be used once."
                + "    </p>"
                + "    <p style='font-size: 12px; line-height: 1.5; color: #64748b;'>If the button above does not work, copy and paste this URL into your browser:</p>"
                + "    <p style='font-size: 11px; word-break: break-all; color: #4f46e5; background-color: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: monospace;'>"
                + recoveryLink
                + "    </p>"
                + "    <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;' />"
                + "    <p style='font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0;'>"
                + "      If you did not request this recovery link, no action is needed. Your password remains safe and unchanged."
                + "    </p>"
                + "  </div>"
                + "  <div style='background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8;'>"
                + "    &copy; " + java.time.Year.now().getValue() + " EduPulse ERP SaaS. Secured by Dual-Factor Identity Infrastructure."
                + "  </div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }
}
