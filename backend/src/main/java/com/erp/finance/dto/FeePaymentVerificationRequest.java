package com.erp.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeePaymentVerificationRequest {
    private String invoiceNumber;
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;
}

