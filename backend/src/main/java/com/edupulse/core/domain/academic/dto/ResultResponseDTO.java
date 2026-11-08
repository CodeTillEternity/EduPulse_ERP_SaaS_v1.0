package com.edupulse.core.domain.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultResponseDTO {

    private Long id;
    private Long examId;
    private String examName;
    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private BigDecimal marksObtained;
    private BigDecimal totalMarks;
    private String gradeLabel;
    private BigDecimal gradePoint;
    private String remarks;
    private String courseCode;
    private String courseName;
}
