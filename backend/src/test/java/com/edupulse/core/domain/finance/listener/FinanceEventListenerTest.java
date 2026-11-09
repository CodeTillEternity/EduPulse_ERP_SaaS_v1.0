package com.edupulse.core.domain.finance.listener;

import com.edupulse.core.domain.finance.dto.BrandedDocumentDTO;
import com.edupulse.core.domain.finance.event.InvoiceGeneratedEvent;
import com.edupulse.core.domain.finance.event.PaymentSuccessEvent;
import com.edupulse.core.domain.finance.service.FinanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.mockito.Mockito.*;

class FinanceEventListenerTest {

    private FinanceService financeService;
    private FinanceEventListener listener;

    @BeforeEach
    void setUp() {
        financeService = mock(FinanceService.class);
        listener = new FinanceEventListener(financeService);
    }

    @Test
    @DisplayName("Should invoke asynchronous invoice document generation upon InvoiceGeneratedEvent")
    void testOnInvoiceGenerated() {
        InvoiceGeneratedEvent event = new InvoiceGeneratedEvent(
                101L,
                "INV-2026-0001",
                42L,
                "Jane Doe",
                "jane@example.edu",
                new BigDecimal("50000.00"),
                LocalDate.now().plusDays(30),
                "tenant-alpha"
        );

        BrandedDocumentDTO mockDoc = BrandedDocumentDTO.builder()
                .documentNumber("INV-2026-0001")
                .studentName("Jane Doe")
                .htmlContent("<html><body>Official Invoice</body></html>")
                .build();

        when(financeService.generateInvoiceDocument(101L)).thenReturn(mockDoc);

        listener.onInvoiceGenerated(event);

        verify(financeService, times(1)).generateInvoiceDocument(101L);
    }

    @Test
    @DisplayName("Should invoke asynchronous payment receipt generation upon PaymentSuccessEvent")
    void testOnPaymentSuccess() {
        PaymentSuccessEvent event = new PaymentSuccessEvent(
                555L,
                101L,
                "INV-2026-0001",
                42L,
                "PAY-REF-999",
                new BigDecimal("25000.00"),
                "RAZORPAY",
                LocalDateTime.now(),
                "tenant-alpha"
        );

        BrandedDocumentDTO mockReceipt = BrandedDocumentDTO.builder()
                .documentNumber("INV-2026-0001")
                .studentName("Jane Doe")
                .htmlContent("<html><body>Official Payment Receipt</body></html>")
                .build();

        when(financeService.generatePaymentReceiptDocument(555L)).thenReturn(mockReceipt);

        listener.onPaymentSuccess(event);

        verify(financeService, times(1)).generatePaymentReceiptDocument(555L);
    }
}
