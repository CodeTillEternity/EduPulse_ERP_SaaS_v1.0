package com.edupulse.core.domain.finance.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Domain event dispatched when a fee payment is successfully recorded or settled.
 * Triggers background receipt generation and asynchronous notification delivery.
 */
public record PaymentSuccessEvent(
        Long paymentId,
        Long invoiceId,
        String invoiceNumber,
        Long studentId,
        String referenceNumber,
        BigDecimal amount,
        String paymentMethod,
        LocalDateTime paymentDate,
        String tenantId
) implements Serializable {
}
