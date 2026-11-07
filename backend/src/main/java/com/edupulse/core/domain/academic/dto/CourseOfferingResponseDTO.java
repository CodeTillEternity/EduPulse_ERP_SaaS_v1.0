package com.edupulse.core.domain.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseOfferingResponseDTO {

    private Long id;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Long facultyId;
    private String facultyName;
    private String facultyEmployeeId;
    private Long batchId;
    private String batchAcademicYear;
    private String semester;
    private String tenantId;
    private LocalDateTime createdAt;
}

