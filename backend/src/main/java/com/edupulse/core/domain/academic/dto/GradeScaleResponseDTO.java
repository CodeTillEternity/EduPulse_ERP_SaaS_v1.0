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
public class GradeScaleResponseDTO {

    private Long id;
    private String grade;
    private BigDecimal minMarks;
    private BigDecimal maxMarks;
    private BigDecimal gradePoint;
}
