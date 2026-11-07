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
public class CourseResponseDTO {

    private Long id;
    private String code;
    private String name;
    private Integer credits;
    private Long departmentId;
    private String departmentName;
    private String tenantId;
    private LocalDateTime createdAt;
}

