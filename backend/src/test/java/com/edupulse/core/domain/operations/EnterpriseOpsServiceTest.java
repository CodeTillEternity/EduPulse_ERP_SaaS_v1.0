package com.edupulse.core.domain.operations;

import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.library.BookAsset;
import com.edupulse.core.domain.library.IssueStatus;
import com.edupulse.core.domain.library.LibraryIssue;
import com.edupulse.core.domain.library.dto.BookRequestDTO;
import com.edupulse.core.domain.library.dto.BookResponseDTO;
import com.edupulse.core.domain.library.dto.IssueRequestDTO;
import com.edupulse.core.domain.library.dto.IssueResponseDTO;
import com.edupulse.core.domain.library.repository.BookAssetRepository;
import com.edupulse.core.domain.library.repository.LibraryIssueRepository;
import com.edupulse.core.domain.library.service.LibraryServiceImpl;
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
import com.edupulse.core.domain.transport.service.TransportServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnterpriseOpsServiceTest {

    private static final String TENANT_ID = "tenant-test";

    @Mock
    private BookAssetRepository bookAssetRepository;

    @Mock
    private LibraryIssueRepository libraryIssueRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private TransportRouteRepository transportRouteRepository;

    @Mock
    private RouteAssignmentRepository routeAssignmentRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private LibraryServiceImpl libraryService;

    @InjectMocks
    private TransportServiceImpl transportService;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ==========================================
    // LIBRARY SERVICE TESTS
    // ==========================================

    @Test
    @DisplayName("addBook catalogs new book asset when ISBN is unique")
    void shouldAddBookSuccessfully() {
        BookRequestDTO request = BookRequestDTO.builder()
                .title("Clean Architecture")
                .author("Robert C. Martin")
                .isbn("978-0134494166")
                .totalCopies(5)
                .build();

        when(bookAssetRepository.existsByIsbnAndTenantId("978-0134494166", TENANT_ID)).thenReturn(false);

        BookAsset savedBook = BookAsset.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .totalCopies(5)
                .availableCopies(5)
                .build();
        savedBook.setId(10L);
        savedBook.setTenantId(TENANT_ID);

        when(bookAssetRepository.save(any(BookAsset.class))).thenReturn(savedBook);

        BookResponseDTO response = libraryService.addBook(request);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getTitle()).isEqualTo("Clean Architecture");
        assertThat(response.getAvailableCopies()).isEqualTo(5);
        verify(bookAssetRepository).save(any(BookAsset.class));
    }

    @Test
    @DisplayName("issueBook decrements availableCopies and creates active LibraryIssue")
    void shouldIssueBookSuccessfully() {
        BookAsset book = BookAsset.builder()
                .title("Design Patterns")
                .author("Gang of Four")
                .isbn("978-0201633610")
                .totalCopies(3)
                .availableCopies(3)
                .build();
        book.setId(1L);
        book.setTenantId(TENANT_ID);

        Student student = new Student();
        student.setId(50L);
        student.setFirstName("Grace");
        student.setLastName("Hopper");
        student.setEnrollmentNumber("STU-001");
        student.setTenantId(TENANT_ID);

        when(bookAssetRepository.findByIdAndTenantId(1L, TENANT_ID)).thenReturn(Optional.of(book));
        when(studentRepository.findByIdAndTenantId(50L, TENANT_ID)).thenReturn(Optional.of(student));

        LibraryIssue savedIssue = LibraryIssue.builder()
                .bookAsset(book)
                .student(student)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(14))
                .status(IssueStatus.ISSUED)
                .build();
        savedIssue.setId(100L);
        savedIssue.setTenantId(TENANT_ID);

        when(libraryIssueRepository.save(any(LibraryIssue.class))).thenReturn(savedIssue);

        IssueResponseDTO response = libraryService.issueBook(1L, 50L);

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getStatus()).isEqualTo(IssueStatus.ISSUED);
        assertThat(book.getAvailableCopies()).isEqualTo(2);
        verify(bookAssetRepository).save(book);
    }

    @Test
    @DisplayName("issueBook throws IllegalStateException when no copies are available")
    void shouldThrowWhenNoCopiesAvailable() {
        BookAsset book = BookAsset.builder()
                .title("Design Patterns")
                .totalCopies(2)
                .availableCopies(0)
                .build();
        book.setId(1L);

        when(bookAssetRepository.findByIdAndTenantId(1L, TENANT_ID)).thenReturn(Optional.of(book));

        assertThatThrownBy(() -> libraryService.issueBook(1L, 50L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No copies available");
    }

    @Test
    @DisplayName("returnBook marks issue RETURNED and increments availableCopies")
    void shouldReturnBookSuccessfully() {
        BookAsset book = BookAsset.builder()
                .title("Design Patterns")
                .totalCopies(3)
                .availableCopies(2)
                .build();
        book.setId(1L);

        Student student = new Student();
        student.setId(50L);
        student.setFirstName("Grace");
        student.setLastName("Hopper");

        LibraryIssue issue = LibraryIssue.builder()
                .bookAsset(book)
                .student(student)
                .issueDate(LocalDate.now().minusDays(5))
                .dueDate(LocalDate.now().plusDays(9))
                .status(IssueStatus.ISSUED)
                .build();
        issue.setId(100L);
        issue.setTenantId(TENANT_ID);

        when(libraryIssueRepository.findByIdAndTenantId(100L, TENANT_ID)).thenReturn(Optional.of(issue));
        when(libraryIssueRepository.save(any(LibraryIssue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IssueResponseDTO response = libraryService.returnBook(100L);

        assertThat(response.getStatus()).isEqualTo(IssueStatus.RETURNED);
        assertThat(response.getReturnDate()).isEqualTo(LocalDate.now());
        assertThat(book.getAvailableCopies()).isEqualTo(3);
        verify(bookAssetRepository).save(book);
    }

    // ==========================================
    // TRANSPORT SERVICE TESTS
    // ==========================================

    @Test
    @DisplayName("createVehicle creates and returns vehicle with tenant scope")
    void shouldCreateVehicleSuccessfully() {
        VehicleRequestDTO request = VehicleRequestDTO.builder()
                .registrationNumber("KA-05-AB-1234")
                .capacity(50)
                .driverName("Arthur Dent")
                .build();

        when(vehicleRepository.existsByRegistrationNumberAndTenantId("KA-05-AB-1234", TENANT_ID)).thenReturn(false);

        Vehicle vehicle = Vehicle.builder()
                .registrationNumber(request.getRegistrationNumber())
                .capacity(50)
                .driverName(request.getDriverName())
                .build();
        vehicle.setId(77L);
        vehicle.setTenantId(TENANT_ID);

        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        VehicleResponseDTO response = transportService.createVehicle(request);

        assertThat(response.getId()).isEqualTo(77L);
        assertThat(response.getRegistrationNumber()).isEqualTo("KA-05-AB-1234");
        assertThat(response.getCapacity()).isEqualTo(50);
    }

    @Test
    @DisplayName("assignStudent checks capacity and saves RouteAssignment")
    void shouldAssignStudentToRoute() {
        Vehicle bus = Vehicle.builder()
                .registrationNumber("KA-05-AB-1234")
                .capacity(40)
                .driverName("Arthur Dent")
                .build();
        bus.setId(1L);

        TransportRoute route = TransportRoute.builder()
                .routeName("Campus Express")
                .stops("Stop A, Stop B")
                .vehicle(bus)
                .monthlyFee(new BigDecimal("150.00"))
                .build();
        route.setId(20L);
        route.setTenantId(TENANT_ID);

        Student student = new Student();
        student.setId(99L);
        student.setFirstName("Linus");
        student.setLastName("Torvalds");
        student.setEnrollmentNumber("STU-099");
        student.setTenantId(TENANT_ID);

        when(transportRouteRepository.findByIdAndTenantId(20L, TENANT_ID)).thenReturn(Optional.of(route));
        when(routeAssignmentRepository.countByRouteIdAndActiveTrueAndTenantId(20L, TENANT_ID)).thenReturn(25L);
        when(studentRepository.findByIdAndTenantId(99L, TENANT_ID)).thenReturn(Optional.of(student));

        RouteAssignment assignment = RouteAssignment.builder()
                .route(route)
                .student(student)
                .pickupStop("Stop B")
                .assignedDate(LocalDate.now())
                .active(true)
                .build();
        assignment.setId(303L);
        assignment.setTenantId(TENANT_ID);

        when(routeAssignmentRepository.save(any(RouteAssignment.class))).thenReturn(assignment);

        AssignmentRequestDTO request = AssignmentRequestDTO.builder()
                .studentId(99L)
                .routeId(20L)
                .pickupStop("Stop B")
                .build();

        AssignmentResponseDTO response = transportService.assignStudent(request);

        assertThat(response.getId()).isEqualTo(303L);
        assertThat(response.getRouteName()).isEqualTo("Campus Express");
        assertThat(response.getStudentName()).isEqualTo("Linus Torvalds");
        assertThat(response.getPickupStop()).isEqualTo("Stop B");
    }

    @Test
    @DisplayName("assignStudent throws IllegalStateException when vehicle capacity is reached")
    void shouldThrowWhenVehicleCapacityExceeded() {
        Vehicle bus = Vehicle.builder()
                .registrationNumber("KA-05-AB-1234")
                .capacity(30)
                .driverName("Arthur Dent")
                .build();
        bus.setId(1L);

        TransportRoute route = TransportRoute.builder()
                .routeName("Campus Express")
                .vehicle(bus)
                .monthlyFee(new BigDecimal("150.00"))
                .build();
        route.setId(20L);

        when(transportRouteRepository.findByIdAndTenantId(20L, TENANT_ID)).thenReturn(Optional.of(route));
        // Current active count equals capacity
        when(routeAssignmentRepository.countByRouteIdAndActiveTrueAndTenantId(20L, TENANT_ID)).thenReturn(30L);

        AssignmentRequestDTO request = AssignmentRequestDTO.builder()
                .studentId(99L)
                .routeId(20L)
                .build();

        assertThatThrownBy(() -> transportService.assignStudent(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("maximum capacity");
    }

    @Test
    @DisplayName("getAllRoutes computes capacityDisplay KPI indicator")
    void shouldIncludeCapacityDisplayInRoutes() {
        Vehicle bus = Vehicle.builder()
                .registrationNumber("KA-01-XX-9999")
                .capacity(50)
                .driverName("Ford Prefect")
                .build();
        bus.setId(2L);

        TransportRoute route = TransportRoute.builder()
                .routeName("West Route")
                .stops("Stop 1, Stop 2")
                .vehicle(bus)
                .monthlyFee(new BigDecimal("100.00"))
                .build();
        route.setId(15L);
        route.setTenantId(TENANT_ID);

        when(transportRouteRepository.findByTenantId(TENANT_ID)).thenReturn(List.of(route));
        when(routeAssignmentRepository.countByRouteIdAndActiveTrueAndTenantId(15L, TENANT_ID)).thenReturn(42L);

        List<RouteResponseDTO> routes = transportService.getAllRoutes();

        assertThat(routes).hasSize(1);
        assertThat(routes.get(0).getAssignedCount()).isEqualTo(42L);
        assertThat(routes.get(0).getCapacityDisplay()).isEqualTo("42/50 Seats Filled");
    }
}
