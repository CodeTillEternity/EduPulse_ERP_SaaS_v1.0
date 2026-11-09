package com.edupulse.core.api.rest;

import com.edupulse.core.domain.library.dto.BookRequestDTO;
import com.edupulse.core.domain.library.dto.BookResponseDTO;
import com.edupulse.core.domain.library.dto.IssueRequestDTO;
import com.edupulse.core.domain.library.dto.IssueResponseDTO;
import com.edupulse.core.domain.library.service.LibraryService;
import com.edupulse.core.domain.transport.dto.AssignmentRequestDTO;
import com.edupulse.core.domain.transport.dto.AssignmentResponseDTO;
import com.edupulse.core.domain.transport.dto.RouteRequestDTO;
import com.edupulse.core.domain.transport.dto.RouteResponseDTO;
import com.edupulse.core.domain.transport.dto.VehicleRequestDTO;
import com.edupulse.core.domain.transport.dto.VehicleResponseDTO;
import com.edupulse.core.domain.transport.service.TransportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for institutional Enterprise Operations:
 * Physical Library Inventory & Book Circulation, and Logistics Fleet Transport & Route Seating.
 */
@RestController("coreEnterpriseOpsController")
@RequestMapping("/api/v1/enterprise-ops")
@Tag(name = "Enterprise Operations", description = "Library inventory, book lending circulation, and transport fleet logistics")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'SUPER_ADMIN', 'ADMIN', 'LIBRARIAN', 'TRANSPORT_MANAGER')")
public class EnterpriseOpsController {

    private final LibraryService libraryService;
    private final TransportService transportService;

    public EnterpriseOpsController(
            @Qualifier("coreLibraryService") LibraryService libraryService,
            @Qualifier("coreTransportService") TransportService transportService) {
        this.libraryService = libraryService;
        this.transportService = transportService;
    }

    // ==========================================
    // LIBRARY ENDPOINTS
    // ==========================================

    @PostMapping("/library/books")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add Book Asset", description = "Catalogs a new book asset into the library inventory")
    public ResponseEntity<BookResponseDTO> addBook(@Valid @RequestBody BookRequestDTO request) {
        BookResponseDTO response = libraryService.addBook(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/library/books")
    @Operation(summary = "List Library Books", description = "Retrieves all cataloged books for the tenant")
    public ResponseEntity<List<BookResponseDTO>> getAllBooks() {
        return ResponseEntity.ok(libraryService.getAllBooks());
    }

    @GetMapping("/library/books/{bookId}")
    @Operation(summary = "Get Book Details", description = "Retrieves details of a specific book asset")
    public ResponseEntity<BookResponseDTO> getBookById(@PathVariable Long bookId) {
        return ResponseEntity.ok(libraryService.getBookById(bookId));
    }

    @PostMapping("/library/issues")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Issue Book", description = "Issues a book copy to an enrolled student")
    public ResponseEntity<IssueResponseDTO> issueBook(@Valid @RequestBody IssueRequestDTO request) {
        IssueResponseDTO response = libraryService.issueBook(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/library/issues/{issueId}/return")
    @Operation(summary = "Return Book", description = "Marks an issued book as returned and restores available inventory")
    public ResponseEntity<IssueResponseDTO> returnBook(@PathVariable Long issueId) {
        IssueResponseDTO response = libraryService.returnBook(issueId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/library/issues/active")
    @Operation(summary = "List Active Issues", description = "Retrieves all currently loaned book circulation records")
    public ResponseEntity<List<IssueResponseDTO>> getActiveIssues() {
        return ResponseEntity.ok(libraryService.getActiveIssues());
    }

    // ==========================================
    // TRANSPORT ENDPOINTS
    // ==========================================

    @PostMapping("/transport/vehicles")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create Vehicle", description = "Registers a new fleet transport vehicle")
    public ResponseEntity<VehicleResponseDTO> createVehicle(@Valid @RequestBody VehicleRequestDTO request) {
        VehicleResponseDTO response = transportService.createVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/transport/vehicles")
    @Operation(summary = "List Vehicles", description = "Retrieves all fleet transport vehicles for the tenant")
    public ResponseEntity<List<VehicleResponseDTO>> getAllVehicles() {
        return ResponseEntity.ok(transportService.getAllVehicles());
    }

    @PostMapping("/transport/routes")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create Route", description = "Defines a new transport route mapped to a vehicle")
    public ResponseEntity<RouteResponseDTO> createRoute(@Valid @RequestBody RouteRequestDTO request) {
        RouteResponseDTO response = transportService.createRoute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/transport/routes")
    @Operation(summary = "List Routes", description = "Retrieves all transport routes with passenger occupancy KPI metrics")
    public ResponseEntity<List<RouteResponseDTO>> getAllRoutes() {
        return ResponseEntity.ok(transportService.getAllRoutes());
    }

    @PostMapping("/transport/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Assign Student to Route", description = "Allocates a seat to a student on a transport route with capacity validation")
    public ResponseEntity<AssignmentResponseDTO> assignStudent(@Valid @RequestBody AssignmentRequestDTO request) {
        AssignmentResponseDTO response = transportService.assignStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/transport/routes/{routeId}/assignments")
    @Operation(summary = "List Route Passengers", description = "Retrieves all active student passenger assignments for a route")
    public ResponseEntity<List<AssignmentResponseDTO>> getRouteAssignments(@PathVariable Long routeId) {
        return ResponseEntity.ok(transportService.getRouteAssignments(routeId));
    }

    @GetMapping("/transport/assignments")
    @Operation(summary = "List All Assignments", description = "Retrieves all student route assignments")
    public ResponseEntity<List<AssignmentResponseDTO>> getAllAssignments() {
        return ResponseEntity.ok(transportService.getAllAssignments());
    }
}
