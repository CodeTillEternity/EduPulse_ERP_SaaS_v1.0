package com.edupulse.core.domain.transport.service;

import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.edupulse.core.domain.transport.RouteAssignment;
import com.edupulse.core.domain.transport.TransportRoute;
import com.edupulse.core.domain.transport.Vehicle;
import com.edupulse.core.domain.transport.dto.AssignmentRequestDTO;
import com.edupulse.core.domain.transport.dto.AssignmentResponseDTO;
import com.edupulse.core.domain.transport.dto.RouteRequestDTO;
import com.edupulse.core.domain.transport.dto.RouteResponseDTO;
import com.edupulse.core.domain.transport.dto.VehicleRequestDTO;
import com.edupulse.core.domain.transport.dto.VehicleResponseDTO;
import com.edupulse.core.domain.transport.repository.RouteAssignmentRepository;
import com.edupulse.core.domain.transport.repository.TransportRouteRepository;
import com.edupulse.core.domain.transport.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Production implementation of TransportService managing fleet vehicles, bus routes, and passenger seating allocations.
 */
@Service("coreTransportService")
@Transactional(readOnly = true)
public class TransportServiceImpl implements TransportService {

    private final VehicleRepository vehicleRepository;
    private final TransportRouteRepository transportRouteRepository;
    private final RouteAssignmentRepository routeAssignmentRepository;
    private final StudentRepository studentRepository;

    public TransportServiceImpl(
            @Qualifier("coreVehicleRepository") VehicleRepository vehicleRepository,
            @Qualifier("coreTransportRouteRepository") TransportRouteRepository transportRouteRepository,
            @Qualifier("coreRouteAssignmentRepository") RouteAssignmentRepository routeAssignmentRepository,
            @Qualifier("coreStudentRepository") StudentRepository studentRepository) {
        this.vehicleRepository = vehicleRepository;
        this.transportRouteRepository = transportRouteRepository;
        this.routeAssignmentRepository = routeAssignmentRepository;
        this.studentRepository = studentRepository;
    }

    private String getEffectiveTenantId() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            return "tenant-cambridge";
        }
        return tenantId;
    }

    @Override
    @Transactional
    public VehicleResponseDTO createVehicle(VehicleRequestDTO request) {
        String tenantId = getEffectiveTenantId();

        if (vehicleRepository.existsByRegistrationNumberAndTenantId(request.getRegistrationNumber(), tenantId)) {
            throw new IllegalArgumentException("Vehicle with registration number " + request.getRegistrationNumber() + " already exists");
        }

        Vehicle vehicle = Vehicle.builder()
                .registrationNumber(request.getRegistrationNumber())
                .capacity(request.getCapacity())
                .driverName(request.getDriverName())
                .build();
        vehicle.setTenantId(tenantId);

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToVehicleResponseDTO(saved);
    }

    @Override
    public List<VehicleResponseDTO> getAllVehicles() {
        String tenantId = getEffectiveTenantId();
        return vehicleRepository.findByTenantId(tenantId).stream()
                .map(this::mapToVehicleResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleResponseDTO getVehicleById(Long id) {
        String tenantId = getEffectiveTenantId();
        Vehicle vehicle = vehicleRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with ID: " + id));
        return mapToVehicleResponseDTO(vehicle);
    }

    @Override
    @Transactional
    public RouteResponseDTO createRoute(RouteRequestDTO request) {
        String tenantId = getEffectiveTenantId();

        Vehicle vehicle = vehicleRepository.findByIdAndTenantId(request.getVehicleId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with ID: " + request.getVehicleId()));

        TransportRoute route = TransportRoute.builder()
                .routeName(request.getRouteName())
                .stops(request.getStops())
                .vehicle(vehicle)
                .monthlyFee(request.getMonthlyFee())
                .build();
        route.setTenantId(tenantId);

        TransportRoute saved = transportRouteRepository.save(route);
        return mapToRouteResponseDTO(saved, 0L);
    }

    @Override
    public List<RouteResponseDTO> getAllRoutes() {
        String tenantId = getEffectiveTenantId();
        return transportRouteRepository.findByTenantId(tenantId).stream()
                .map(route -> {
                    long activeCount = routeAssignmentRepository.countByRouteIdAndActiveTrueAndTenantId(route.getId(), tenantId);
                    return mapToRouteResponseDTO(route, activeCount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public RouteResponseDTO getRouteById(Long id) {
        String tenantId = getEffectiveTenantId();
        TransportRoute route = transportRouteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Transport route not found with ID: " + id));
        long activeCount = routeAssignmentRepository.countByRouteIdAndActiveTrueAndTenantId(route.getId(), tenantId);
        return mapToRouteResponseDTO(route, activeCount);
    }

    @Override
    @Transactional
    public AssignmentResponseDTO assignStudent(AssignmentRequestDTO request) {
        return assignStudent(request.getStudentId(), request.getRouteId(), request.getPickupStop());
    }

    @Override
    @Transactional
    public AssignmentResponseDTO assignStudent(Long studentId, Long routeId, String pickupStop) {
        String tenantId = getEffectiveTenantId();

        TransportRoute route = transportRouteRepository.findByIdAndTenantId(routeId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Transport route not found with ID: " + routeId));

        if (route.getVehicle() == null) {
            throw new IllegalStateException("Transport route does not have an assigned vehicle");
        }

        long activeCount = routeAssignmentRepository.countByRouteIdAndActiveTrueAndTenantId(routeId, tenantId);
        int capacity = route.getVehicle().getCapacity();
        if (activeCount >= capacity) {
            throw new IllegalStateException("Vehicle is at maximum capacity (" + activeCount + "/" + capacity + ")");
        }

        Student student = studentRepository.findByIdAndTenantId(studentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        RouteAssignment assignment = RouteAssignment.builder()
                .route(route)
                .student(student)
                .pickupStop(pickupStop != null && !pickupStop.isBlank() ? pickupStop.trim() : "Main Campus Gate")
                .assignedDate(LocalDate.now())
                .active(true)
                .build();
        assignment.setTenantId(tenantId);

        RouteAssignment saved = routeAssignmentRepository.save(assignment);
        return mapToAssignmentResponseDTO(saved);
    }

    @Override
    public List<AssignmentResponseDTO> getRouteAssignments(Long routeId) {
        String tenantId = getEffectiveTenantId();
        return routeAssignmentRepository.findByRouteIdAndActiveTrueAndTenantId(routeId, tenantId).stream()
                .map(this::mapToAssignmentResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AssignmentResponseDTO> getAllAssignments() {
        String tenantId = getEffectiveTenantId();
        return routeAssignmentRepository.findByTenantId(tenantId).stream()
                .map(this::mapToAssignmentResponseDTO)
                .collect(Collectors.toList());
    }

    private VehicleResponseDTO mapToVehicleResponseDTO(Vehicle vehicle) {
        return VehicleResponseDTO.builder()
                .id(vehicle.getId())
                .registrationNumber(vehicle.getRegistrationNumber())
                .capacity(vehicle.getCapacity())
                .driverName(vehicle.getDriverName())
                .tenantId(vehicle.getTenantId())
                .build();
    }

    private RouteResponseDTO mapToRouteResponseDTO(TransportRoute route, long activeCount) {
        Long vehicleId = null;
        String vehicleReg = "";
        Integer vehicleCap = 0;
        String driverName = "";

        if (route.getVehicle() != null) {
            vehicleId = route.getVehicle().getId();
            vehicleReg = route.getVehicle().getRegistrationNumber();
            vehicleCap = route.getVehicle().getCapacity();
            driverName = route.getVehicle().getDriverName();
        }

        String capacityDisplay = String.format("%d/%d Seats Filled", activeCount, vehicleCap);

        return RouteResponseDTO.builder()
                .id(route.getId())
                .routeName(route.getRouteName())
                .stops(route.getStops())
                .vehicleId(vehicleId)
                .vehicleRegistrationNumber(vehicleReg)
                .vehicleCapacity(vehicleCap)
                .driverName(driverName)
                .monthlyFee(route.getMonthlyFee())
                .assignedCount(activeCount)
                .capacityDisplay(capacityDisplay)
                .tenantId(route.getTenantId())
                .build();
    }

    private AssignmentResponseDTO mapToAssignmentResponseDTO(RouteAssignment assignment) {
        Long studentId = null;
        String studentName = "";
        String enrollmentNumber = "";

        if (assignment.getStudent() != null) {
            studentId = assignment.getStudent().getId();
            String firstName = assignment.getStudent().getFirstName() != null ? assignment.getStudent().getFirstName() : "";
            String lastName = assignment.getStudent().getLastName() != null ? assignment.getStudent().getLastName() : "";
            studentName = (firstName + " " + lastName).trim();
            enrollmentNumber = assignment.getStudent().getEnrollmentNumber() != null ? assignment.getStudent().getEnrollmentNumber() : "";
        }

        Long routeId = null;
        String routeName = "";
        if (assignment.getRoute() != null) {
            routeId = assignment.getRoute().getId();
            routeName = assignment.getRoute().getRouteName();
        }

        return AssignmentResponseDTO.builder()
                .id(assignment.getId())
                .studentId(studentId)
                .studentName(studentName)
                .enrollmentNumber(enrollmentNumber)
                .routeId(routeId)
                .routeName(routeName)
                .pickupStop(assignment.getPickupStop())
                .assignedDate(assignment.getAssignedDate())
                .active(assignment.getActive())
                .tenantId(assignment.getTenantId())
                .build();
    }
}
