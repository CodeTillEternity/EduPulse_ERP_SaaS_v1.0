package com.edupulse.core.domain.academic.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamQuestionDTO {

    private Long id;

    @NotBlank(message = "Question text is required")
    private String questionText;

    private String questionType;

    private String optionsJson;

    private String correctAnswer;

    @NotNull(message = "Marks are required")
    @DecimalMin(value = "0.01", message = "Marks must be greater than zero")
    private BigDecimal marks;

    private Integer orderIndex;
}
