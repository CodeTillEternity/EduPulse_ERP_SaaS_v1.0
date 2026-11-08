package com.edupulse.core.domain.operations.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * Request payload for scheduling a class timetable slot.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableRequestDTO {

    @NotNull(message = "CourseOffering ID is required")
    private Long courseOfferingId;

    @NotBlank(message = "Day of week is required")
    private String dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Room number is required")
    private String roomNumber;
}
