package com.erp.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeOrderResponse {
    private String orderId;
    private String invoiceNumber;
    private Long amountInPaise;
    private Double displayAmount;
    private String currency;
    private String keyId;
    private String receipt;
    private String studentName;
    private String studentEmail;
    private String description;
}

