package com.edupulse.core.domain.hr.dto;

import com.edupulse.core.domain.hr.LeaveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponseDTO {

    private Long id;
    private Long facultyId;
    private String facultyName;
    private String employeeId;
    private String departmentName;
    private LocalDate startDate;
    private LocalDate endDate;
    private long daysCount;
    private String reason;
    private LeaveStatus status;
    private String reviewedBy;
    private String reviewNotes;
    private LocalDateTime reviewedAt;
}

