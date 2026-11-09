package com.edupulse.core.domain.finance.dto;

import com.edupulse.core.domain.finance.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {

    private Long id;
    private Long invoiceId;
    private String invoiceNumber;
    private BigDecimal amount;
    private String paymentMethod;
    private String referenceNumber;
    private LocalDateTime paymentDate;
    private String notes;
    private BigDecimal remainingInvoiceBalance;
    private InvoiceStatus invoiceStatus;
    private String institutionName;
    private String logoUrl;
    private String primaryColorHex;
    private Boolean watermarkRemoved;
}
