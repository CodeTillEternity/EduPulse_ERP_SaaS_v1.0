package com.erp.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeOrderRequest {
    private String invoiceNumber;
    private Long amountInPaise;
    private String studentName;
    private String studentEmail;
    private String description;
}

