package com.edupulse.core.domain.academic.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamRequestDTO {

    @NotBlank(message = "Exam name is required")
    private String name;

    @NotNull(message = "Exam date is required")
    private LocalDate examDate;

    @NotNull(message = "Total marks is required")
    @DecimalMin(value = "0.01", message = "Total marks must be greater than zero")
    private BigDecimal totalMarks;

    @NotNull(message = "Course offering ID is required")
    private Long courseOfferingId;
}
