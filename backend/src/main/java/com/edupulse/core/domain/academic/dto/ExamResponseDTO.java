package com.edupulse.core.domain.academic.dto;

import com.edupulse.core.domain.academic.ExamStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponseDTO {

    private Long id;
    private String name;
    private String title;
    private LocalDate examDate;
    private LocalDateTime scheduledStartTime;
    private Integer durationMinutes;
    private BigDecimal totalMarks;
    private BigDecimal maxMarks;
    private BigDecimal passingMarks;
    private ExamStatus status;
    private Long courseOfferingId;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String facultyName;
    private Long batchId;
    private String batchName;
    private String semester;
    private List<ExamQuestionDTO> questions;

    public String getTitle() {
        return title != null && !title.isBlank() ? title : name;
    }

    public String getName() {
        return name != null && !name.isBlank() ? name : title;
    }

    public BigDecimal getMaxMarks() {
        return maxMarks != null ? maxMarks : totalMarks;
    }

    public BigDecimal getTotalMarks() {
        return totalMarks != null ? totalMarks : maxMarks;
    }
}
