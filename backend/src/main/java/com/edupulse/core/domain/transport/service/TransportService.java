package com.edupulse.core.domain.transport.service;

import com.edupulse.core.domain.transport.dto.AssignmentRequestDTO;
import com.edupulse.core.domain.transport.dto.AssignmentResponseDTO;
import com.edupulse.core.domain.transport.dto.RouteRequestDTO;
import com.edupulse.core.domain.transport.dto.RouteResponseDTO;
import com.edupulse.core.domain.transport.dto.VehicleRequestDTO;
import com.edupulse.core.domain.transport.dto.VehicleResponseDTO;

import java.util.List;

/**
 * Service contract for institutional transport management: vehicles, routes, and passenger assignments.
 */
public interface TransportService {

    VehicleResponseDTO createVehicle(VehicleRequestDTO request);

    List<VehicleResponseDTO> getAllVehicles();

    VehicleResponseDTO getVehicleById(Long id);

    RouteResponseDTO createRoute(RouteRequestDTO request);

    List<RouteResponseDTO> getAllRoutes();

    RouteResponseDTO getRouteById(Long id);

    AssignmentResponseDTO assignStudent(AssignmentRequestDTO request);

    AssignmentResponseDTO assignStudent(Long studentId, Long routeId, String pickupStop);

    List<AssignmentResponseDTO> getRouteAssignments(Long routeId);

    List<AssignmentResponseDTO> getAllAssignments();
}
