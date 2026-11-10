package com.erp.common.exception;

import com.erp.subscription.model.SaaSTier;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when an institution attempts to access a premium capability
 * that requires a higher SaaS subscription tier (HTTP 402 Payment Required).
 */
@ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
public class PaymentRequiredException extends EduPulseBusinessException {

    private final SaaSTier requiredTier;
    private final SaaSTier currentTier;

    public PaymentRequiredException(String message) {
        this(message, SaaSTier.ENTERPRISE, SaaSTier.TRIAL);
    }

    public PaymentRequiredException(String message, SaaSTier requiredTier, SaaSTier currentTier) {
        super(message, "PAYMENT_REQUIRED", HttpStatus.PAYMENT_REQUIRED);
        this.requiredTier = requiredTier != null ? requiredTier : SaaSTier.ENTERPRISE;
        this.currentTier = currentTier != null ? currentTier : SaaSTier.TRIAL;
    }

    public SaaSTier getRequiredTier() {
        return requiredTier;
    }

    public SaaSTier getCurrentTier() {
        return currentTier;
    }
}
