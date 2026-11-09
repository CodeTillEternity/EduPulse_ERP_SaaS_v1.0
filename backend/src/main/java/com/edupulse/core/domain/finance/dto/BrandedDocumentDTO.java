package com.edupulse.core.domain.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO representing white-labeled financial document metadata and HTML preview.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandedDocumentDTO {

    private String documentType; // "FEE_INVOICE" or "PAYMENT_RECEIPT"
    private String documentNumber;
    private String tenantId;
    private String institutionName;
    private String logoUrl;
    private String primaryColorHex;
    private String secondaryColorHex;
    private boolean watermarkRemoved;
    private String studentName;
    private String studentEnrollmentNumber;
    private BigDecimal amount;
    private LocalDate documentDate;
    private String htmlContent;
}
