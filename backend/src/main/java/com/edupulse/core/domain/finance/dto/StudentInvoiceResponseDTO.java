package com.edupulse.core.domain.finance.dto;

import com.edupulse.core.domain.finance.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentInvoiceResponseDTO {

    private Long id;
    private String invoiceNumber;
    private Long studentId;
    private String studentName;
    private String studentEnrollmentNumber;
    private Long feeStructureId;
    private String feeStructureName;
    private BigDecimal grossAmount;
    private BigDecimal discount;
    private BigDecimal netAmount;
    private BigDecimal amountPaid;
    private BigDecimal outstandingBalance;
    private LocalDate dueDate;
    private InvoiceStatus status;
    private LocalDateTime createdAt;
    private String institutionName;
    private String logoUrl;
    private String primaryColorHex;
    private Boolean watermarkRemoved;
}
