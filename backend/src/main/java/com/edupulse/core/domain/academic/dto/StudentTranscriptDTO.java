package com.edupulse.core.domain.academic.dto;

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
public class StudentTranscriptDTO {

    private Long studentId;
    private String enrollmentNumber;
    private String studentName;
    private String email;
    private Long batchId;
    private String batchName;
    private BigDecimal cumulativeGpa;
    private int totalExams;
    private List<ResultResponseDTO> results;
}
