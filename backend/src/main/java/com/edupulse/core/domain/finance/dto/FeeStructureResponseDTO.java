package com.edupulse.core.domain.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeStructureResponseDTO {

    private Long id;
    private String name;
    private Long batchId;
    private String batchName;
    private BigDecimal totalAmount;
    private List<FeeStructureItemResponseDTO> items;
    private LocalDateTime createdAt;
}
