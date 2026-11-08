package com.edupulse.core.domain.academic.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeScaleDTO {

    @NotBlank(message = "Grade label is required")
    private String grade;

    @NotNull(message = "Minimum marks is required")
    @DecimalMin(value = "0.00", message = "Minimum marks must be non-negative")
    private BigDecimal minMarks;

    @NotNull(message = "Maximum marks is required")
    @DecimalMin(value = "0.01", message = "Maximum marks must be greater than zero")
    private BigDecimal maxMarks;

    @NotNull(message = "Grade point is required")
    @DecimalMin(value = "0.00", message = "Grade point must be non-negative")
    private BigDecimal gradePoint;
}
