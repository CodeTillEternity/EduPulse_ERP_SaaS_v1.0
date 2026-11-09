package com.edupulse.core.domain.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Payload returned to the client to initialize Razorpay Standard Checkout modal.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeCheckoutResponseDTO {

    private String orderId;
    private Long amount; // Amount in paise
    private BigDecimal displayAmount; // Human-readable amount in INR
    private String currency; // "INR"
    private String keyId; // Public Razorpay Key ID
    private Long invoiceId;
    private String invoiceNumber;
    private String studentName;
    private String studentEmail;
    private String description;
}
