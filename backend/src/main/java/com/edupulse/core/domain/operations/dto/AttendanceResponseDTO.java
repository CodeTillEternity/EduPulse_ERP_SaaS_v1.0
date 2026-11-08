package com.edupulse.core.domain.operations.dto;

import com.edupulse.core.domain.operations.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Response payload representing a persisted student attendance record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponseDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private Long timetableEntryId;
    private LocalDate date;
    private AttendanceStatus status;
    private String tenantId;
}
