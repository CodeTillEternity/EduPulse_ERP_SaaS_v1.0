package com.erp.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentInvoiceLedgerDto {
    private String invoiceNumber;
    private String title;
    private String term;
    private Double totalAmount;
    private Long amountInPaise;
    private String status; // PENDING, PAID, OVERDUE
    private Instant dueDate;
    private Instant paidAt;
    private String paymentReference;
    private List<FeeBreakdownItem> breakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeeBreakdownItem {
        private String head;
        private Double amount;
    }
}
