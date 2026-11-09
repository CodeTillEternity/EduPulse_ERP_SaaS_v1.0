package com.edupulse.core.domain.academic.dto;

import com.edupulse.core.domain.academic.ExamStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ExamDefinitionDTO {

    private Long id;

    @NotBlank(message = "Exam title is required")
    private String title;

    private Long courseOfferingId;

    private Long courseId;

    @NotNull(message = "Scheduled start time is required")
    private LocalDateTime scheduledStartTime;

    @NotNull(message = "Duration in minutes is required")
    private Integer durationMinutes;

    @NotNull(message = "Maximum marks are required")
    @DecimalMin(value = "0.01", message = "Maximum marks must be positive")
    private BigDecimal maxMarks;

    @NotNull(message = "Passing marks are required")
    @DecimalMin(value = "0.00", message = "Passing marks cannot be negative")
    private BigDecimal passingMarks;

    private ExamStatus status;

    private List<ExamQuestionDTO> questions;
}
