package com.edupulse.core.domain.transport;

import com.edupulse.core.domain.student.Student;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class TransportDomainTest {

    @Test
    @DisplayName("Vehicle entity instantiates with registration, capacity, driver, and tenant isolation")
    void shouldCreateVehicleEntity() {
        Vehicle bus = Vehicle.builder()
                .registrationNumber("KA-01-EQ-9876")
                .capacity(45)
                .driverName("Robert Vance")
                .build();
        bus.setId(10L);
        bus.setTenantId("tenant-cambridge");

        assertThat(bus.getId()).isEqualTo(10L);
        assertThat(bus.getRegistrationNumber()).isEqualTo("KA-01-EQ-9876");
        assertThat(bus.getCapacity()).isEqualTo(45);
        assertThat(bus.getDriverName()).isEqualTo("Robert Vance");
        assertThat(bus.getTenantId()).isEqualTo("tenant-cambridge");
    }

    @Test
    @DisplayName("TransportRoute entity links route details to assigned Vehicle")
    void shouldCreateTransportRouteEntity() {
        Vehicle bus = Vehicle.builder()
                .registrationNumber("KA-01-EQ-9876")
                .capacity(45)
                .driverName("Robert Vance")
                .build();
        bus.setId(10L);

        TransportRoute route = TransportRoute.builder()
                .routeName("Route 4 - North Campus Express")
                .stops("Central Station, North Gate, Science Block, Main Auditorium")
                .vehicle(bus)
                .monthlyFee(new BigDecimal("120.00"))
                .build();
        route.setId(20L);
        route.setTenantId("tenant-cambridge");

        assertThat(route.getId()).isEqualTo(20L);
        assertThat(route.getRouteName()).isEqualTo("Route 4 - North Campus Express");
        assertThat(route.getStops()).contains("Science Block");
        assertThat(route.getVehicle().getRegistrationNumber()).isEqualTo("KA-01-EQ-9876");
        assertThat(route.getMonthlyFee()).isEqualByComparingTo("120.00");
        assertThat(route.getTenantId()).isEqualTo("tenant-cambridge");
    }

    @Test
    @DisplayName("RouteAssignment entity maps Student to TransportRoute with pickup stop and active flag")
    void shouldCreateRouteAssignmentEntity() {
        TransportRoute route = TransportRoute.builder()
                .routeName("Route 4 - North Campus Express")
                .stops("Central Station, North Gate, Science Block, Main Auditorium")
                .monthlyFee(new BigDecimal("120.00"))
                .build();
        route.setId(20L);

        Student student = new Student();
        student.setId(505L);
        student.setEnrollmentNumber("STU-ENG-042");
        student.setFirstName("Alan");
        student.setLastName("Turing");

        LocalDate today = LocalDate.now();

        RouteAssignment assignment = RouteAssignment.builder()
                .route(route)
                .student(student)
                .pickupStop("Central Station")
                .assignedDate(today)
                .active(true)
                .build();
        assignment.setId(300L);
        assignment.setTenantId("tenant-cambridge");

        assertThat(assignment.getId()).isEqualTo(300L);
        assertThat(assignment.getRoute().getRouteName()).isEqualTo("Route 4 - North Campus Express");
        assertThat(assignment.getStudent().getEnrollmentNumber()).isEqualTo("STU-ENG-042");
        assertThat(assignment.getPickupStop()).isEqualTo("Central Station");
        assertThat(assignment.getAssignedDate()).isEqualTo(today);
        assertThat(assignment.getActive()).isTrue();
        assertThat(assignment.getTenantId()).isEqualTo("tenant-cambridge");
    }
}
