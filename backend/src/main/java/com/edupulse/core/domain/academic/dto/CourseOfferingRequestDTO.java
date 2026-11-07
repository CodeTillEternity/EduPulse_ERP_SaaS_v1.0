package com.edupulse.core.domain.academic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseOfferingRequestDTO {

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Faculty instructor ID is required")
    private Long facultyId;

    @NotNull(message = "Batch ID is required")
    private Long batchId;

    @NotBlank(message = "Semester is required")
    private String semester;
}

