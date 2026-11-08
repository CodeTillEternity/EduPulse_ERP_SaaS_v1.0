package com.edupulse.core.domain.finance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class FeeStructureRequestDTO {

    @NotBlank(message = "Fee structure name is required")
    private String name;

    @NotNull(message = "Batch ID is required")
    private Long batchId;

    private BigDecimal totalAmount;

    @NotEmpty(message = "Fee structure must contain at least one line item")
    @Valid
    private List<FeeStructureItemRequestDTO> items;
}
