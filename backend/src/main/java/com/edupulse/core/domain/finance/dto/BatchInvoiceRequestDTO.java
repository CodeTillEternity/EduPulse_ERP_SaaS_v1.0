package com.edupulse.core.domain.finance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchInvoiceRequestDTO {

    @NotNull(message = "Batch ID is required")
    private Long batchId;

    @NotNull(message = "Fee structure ID is required")
    private Long feeStructureId;

    private LocalDate dueDate;

    private BigDecimal discount;
}
