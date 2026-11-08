package com.edupulse.core.domain.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentLedgerResponseDTO {

    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private String email;
    private String batchName;
    private BigDecimal totalInvoiced;
    private BigDecimal totalPaid;
    private BigDecimal totalOutstanding;
    private List<StudentInvoiceResponseDTO> invoices;
    private List<PaymentResponseDTO> payments;
}
