package com.edupulse.core.domain.transport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Response DTO representing a student assignment to a transport route.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponseDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private Long routeId;
    private String routeName;
    private String pickupStop;
    private LocalDate assignedDate;
    private Boolean active;
    private String tenantId;
}
