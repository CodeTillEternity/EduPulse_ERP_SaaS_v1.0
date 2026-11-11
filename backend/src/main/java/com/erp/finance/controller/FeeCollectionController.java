package com.erp.finance.controller;

import com.erp.finance.dto.FeeOrderRequest;
import com.erp.finance.dto.FeeOrderResponse;
import com.erp.finance.dto.FeePaymentVerificationRequest;
import com.erp.finance.dto.StudentInvoiceLedgerDto;
import com.erp.finance.service.FeeCollectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fees")
public class FeeCollectionController {

    private final FeeCollectionService feeCollectionService;

    public FeeCollectionController(FeeCollectionService feeCollectionService) {
        this.feeCollectionService = feeCollectionService;
    }

    @GetMapping("/ledger")
    @PreAuthorize("hasAnyRole('STUDENT', 'PARENT', 'FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<StudentInvoiceLedgerDto>> getLedgerInvoices() {
        return ResponseEntity.ok(feeCollectionService.getStudentInvoices());
    }

    @PostMapping("/orders/create")
    @PreAuthorize("hasAnyRole('STUDENT', 'PARENT', 'FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<FeeOrderResponse> createFeeOrder(@RequestBody FeeOrderRequest request) {
        return ResponseEntity.ok(feeCollectionService.createOrderForInvoice(request));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('STUDENT', 'PARENT', 'FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<StudentInvoiceLedgerDto> verifyPayment(@RequestBody FeePaymentVerificationRequest request) {
        return ResponseEntity.ok(feeCollectionService.verifyPayment(request));
    }

    @PostMapping("/webhooks/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        boolean processed = feeCollectionService.handleRazorpayWebhook(rawPayload, signature);
        if (processed) {
            return ResponseEntity.ok("{\"status\":\"ok\"}");
        }
        return ResponseEntity.badRequest().body("{\"status\":\"invalid_signature\"}");
    }
}
