package com.edupulse.core.domain.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponseDTO {

    private Long id;
    private String name;
    private LocalDate examDate;
    private BigDecimal totalMarks;
    private Long courseOfferingId;
    private String courseCode;
    private String courseName;
    private String facultyName;
    private Long batchId;
    private String batchName;
    private String semester;
}
