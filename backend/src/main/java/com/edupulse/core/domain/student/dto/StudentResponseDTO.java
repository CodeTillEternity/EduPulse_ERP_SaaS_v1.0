package com.edupulse.core.domain.student.dto;

import com.edupulse.core.domain.student.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for student registry details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponseDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String enrollmentNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String tenantId;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Long batchId;
    private String academicYear;
    private Integer currentSemester;
    private EnrollmentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

