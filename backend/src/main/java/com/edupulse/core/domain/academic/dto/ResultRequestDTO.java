package com.edupulse.core.domain.academic.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultRequestDTO {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Marks obtained is required")
    @DecimalMin(value = "0.00", message = "Marks obtained cannot be negative")
    private BigDecimal marksObtained;

    private String remarks;
}
