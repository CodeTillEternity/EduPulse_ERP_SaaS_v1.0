package com.edupulse.core.domain.transport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO representing an institutional transport route with live capacity utilization metrics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteResponseDTO {
    private Long id;
    private String routeName;
    private String stops;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private Integer vehicleCapacity;
    private String driverName;
    private BigDecimal monthlyFee;
    private Long assignedCount;
    private String capacityDisplay;
    private String tenantId;
}
