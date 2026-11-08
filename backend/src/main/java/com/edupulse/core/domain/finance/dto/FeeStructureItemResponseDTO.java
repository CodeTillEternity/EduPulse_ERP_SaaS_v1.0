package com.edupulse.core.domain.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeStructureItemResponseDTO {

    private Long id;
    private Long feeHeadId;
    private String feeHeadName;
    private BigDecimal amount;
}
