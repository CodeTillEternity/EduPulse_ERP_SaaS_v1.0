package com.edupulse.core.domain.finance.listener;

import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.finance.dto.BrandedDocumentDTO;
import com.edupulse.core.domain.finance.event.InvoiceGeneratedEvent;
import com.edupulse.core.domain.finance.event.PaymentSuccessEvent;
import com.edupulse.core.domain.finance.service.FinanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Asynchronous event listener executing in background thread pool.
 * Offloads compute-heavy branded invoice PDF rendering and receipt generation from synchronous HTTP request threads.
 */
@Component
public class FinanceEventListener {

    private static final Logger log = LoggerFactory.getLogger(FinanceEventListener.class);

    private final FinanceService financeService;

    public FinanceEventListener(FinanceService financeService) {
        this.financeService = financeService;
    }

    /**
     * Listens for invoice generation events to compile institutional HTML/PDF invoices in the background.
     */
    @Async("taskExecutor")
    @EventListener
    public void onInvoiceGenerated(InvoiceGeneratedEvent event) {
        log.info("Offloading invoice document generation to background worker for invoiceId [{}] in tenant [{}]",
                event.invoiceId(), event.tenantId());

        try {
            if (event.tenantId() != null) {
                TenantContext.setTenantId(event.tenantId());
                com.erp.multitenancy.TenantContext.setTenantId(event.tenantId());
            }

            BrandedDocumentDTO invoiceDoc = financeService.generateInvoiceDocument(event.invoiceId());
            log.info("Successfully compiled background invoice document [{}] for student [{}], size: {} chars",
                    invoiceDoc.getDocumentNumber(), invoiceDoc.getStudentName(),
                    invoiceDoc.getHtmlContent() != null ? invoiceDoc.getHtmlContent().length() : 0);

        } catch (Exception ex) {
            log.error("Failed to asynchronously process invoice generation for invoice [{}]: {}",
                    event.invoiceId(), ex.getMessage(), ex);
        } finally {
            TenantContext.clear();
            com.erp.multitenancy.TenantContext.clear();
        }
    }

    /**
     * Listens for payment success events to compile branded official payment receipts in the background.
     */
    @Async("taskExecutor")
    @EventListener
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        log.info("Offloading payment receipt generation to background worker for paymentId [{}] in tenant [{}]",
                event.paymentId(), event.tenantId());

        try {
            if (event.tenantId() != null) {
                TenantContext.setTenantId(event.tenantId());
                com.erp.multitenancy.TenantContext.setTenantId(event.tenantId());
            }

            BrandedDocumentDTO receiptDoc = financeService.generatePaymentReceiptDocument(event.paymentId());
            log.info("Successfully compiled background payment receipt [{}] for student [{}], size: {} chars",
                    receiptDoc.getDocumentNumber(), receiptDoc.getStudentName(),
                    receiptDoc.getHtmlContent() != null ? receiptDoc.getHtmlContent().length() : 0);

        } catch (Exception ex) {
            log.error("Failed to asynchronously process payment receipt for payment [{}]: {}",
                    event.paymentId(), ex.getMessage(), ex);
        } finally {
            TenantContext.clear();
            com.erp.multitenancy.TenantContext.clear();
        }
    }
}
