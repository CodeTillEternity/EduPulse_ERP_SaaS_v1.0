package com.edupulse.core.domain.transport.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for assigning a student to a transport route.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentRequestDTO {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Transport Route ID is required")
    private Long routeId;

    private String pickupStop;
}
