package com.edupulse.core.domain.finance.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Domain event dispatched when student invoices are batch generated.
 * Triggers background asynchronous document rendering and institutional dispatch.
 */
public record InvoiceGeneratedEvent(
        Long invoiceId,
        String invoiceNumber,
        Long studentId,
        String studentName,
        String studentEmail,
        BigDecimal amount,
        LocalDate dueDate,
        String tenantId
) implements Serializable {
}
