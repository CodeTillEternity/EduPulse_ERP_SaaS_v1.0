package com.edupulse.core.domain.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamStartResponseDTO {

    private Long submissionId;
    private Long examId;
    private String title;
    private Integer durationMinutes;
    private LocalDateTime startedAt;
    private String clientIp;
    private List<ExamQuestionDTO> questions;
    private String status;
}
