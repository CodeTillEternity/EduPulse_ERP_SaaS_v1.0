package com.erp.auth.event;

import com.erp.auth.entity.AppUser;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Domain event dispatched when a valid user completes dual-factor verification
 * and requests a cryptographic password reset token.
 */
@Getter
public class PasswordResetRequestedEvent extends ApplicationEvent {

    private final AppUser user;
    private final String token;
    private final String tenantId;

    public PasswordResetRequestedEvent(Object source, AppUser user, String token, String tenantId) {
        super(source);
        this.user = user;
        this.token = token;
        this.tenantId = tenantId;
    }
}
