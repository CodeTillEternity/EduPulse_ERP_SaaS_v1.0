package com.edupulse.core.domain.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamSubmissionResponseDTO {

    private Long submissionId;
    private Long examId;
    private String studentName;
    private BigDecimal score;
    private BigDecimal maxMarks;
    private BigDecimal passingMarks;
    private boolean passed;
    private String status;
    private LocalDateTime submittedAt;
    private boolean sebValidated;
}
