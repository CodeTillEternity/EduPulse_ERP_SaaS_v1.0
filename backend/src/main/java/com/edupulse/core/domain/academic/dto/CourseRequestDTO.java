package com.edupulse.core.domain.academic.dto;

import jakarta.validation.constraints.Min;
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
public class CourseRequestDTO {

    @NotBlank(message = "Course code is required")
    private String code;

    @NotBlank(message = "Course name is required")
    private String name;

    @NotNull(message = "Credits are required")
    @Min(value = 1, message = "Course must have at least 1 credit")
    private Integer credits;

    @NotNull(message = "Department ID is required")
    private Long departmentId;
}

