package com.edupulse.core.domain.transport.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for creating or updating a transport route.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteRequestDTO {

    @NotBlank(message = "Route name is required")
    private String routeName;

    @NotBlank(message = "Route stops are required")
    private String stops;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Monthly fee is required")
    @DecimalMin(value = "0.00", message = "Monthly fee cannot be negative")
    private BigDecimal monthlyFee;
}
