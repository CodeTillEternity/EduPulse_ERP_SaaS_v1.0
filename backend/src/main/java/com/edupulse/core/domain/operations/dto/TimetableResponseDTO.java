package com.edupulse.core.domain.operations.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * Response representation of a scheduled timetable entry.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableResponseDTO {
    private Long id;
    private Long courseOfferingId;
    private String courseCode;
    private String courseName;
    private Long facultyId;
    private String facultyName;
    private Long batchId;
    private String batchName;
    private String semester;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String roomNumber;
    private String tenantId;
}
