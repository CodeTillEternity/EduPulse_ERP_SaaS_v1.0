package com.edupulse.core.api.rest;

import com.edupulse.core.domain.library.IssueStatus;
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
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@ContextConfiguration(classes = {
        EnterpriseOpsController.class,
        EnterpriseOpsControllerTest.SecurityTestConfig.class
})
class EnterpriseOpsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean(name = "coreLibraryService")
    private LibraryService libraryService;

    @MockBean(name = "coreTransportService")
    private TransportService transportService;

    @Configuration
    @EnableWebSecurity
    @EnableMethodSecurity(prePostEnabled = true)
    static class SecurityTestConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated());
            return http.build();
        }

        @Bean
        public ObjectMapper objectMapper() {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            return mapper;
        }
    }

    @Test
    @WithMockUser(roles = "SUPERADMIN")
    @DisplayName("POST /api/v1/enterprise-ops/library/books returns 201 Created")
    void shouldAddBook() throws Exception {
        BookRequestDTO request = BookRequestDTO.builder()
                .title("Introduction to Algorithms")
                .author("Thomas Cormen")
                .isbn("978-0262033848")
                .totalCopies(10)
                .build();

        BookResponseDTO response = BookResponseDTO.builder()
                .id(1L)
                .title("Introduction to Algorithms")
                .author("Thomas Cormen")
                .isbn("978-0262033848")
                .totalCopies(10)
                .availableCopies(10)
                .build();

        when(libraryService.addBook(any(BookRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/enterprise-ops/library/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Introduction to Algorithms"));
    }

    @Test
    @WithMockUser(roles = "LIBRARIAN")
    @DisplayName("POST /api/v1/enterprise-ops/library/issues returns 201 Created")
    void shouldIssueBook() throws Exception {
        IssueRequestDTO request = IssueRequestDTO.builder()
                .bookId(1L)
                .studentId(2L)
                .build();

        IssueResponseDTO response = IssueResponseDTO.builder()
                .id(10L)
                .bookId(1L)
                .studentId(2L)
                .status(IssueStatus.ISSUED)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(14))
                .build();

        when(libraryService.issueBook(any(IssueRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/enterprise-ops/library/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.status").value("ISSUED"));
    }

    @Test
    @WithMockUser(roles = "LIBRARIAN")
    @DisplayName("POST /api/v1/enterprise-ops/library/issues/{id}/return returns 200 OK")
    void shouldReturnBook() throws Exception {
        IssueResponseDTO response = IssueResponseDTO.builder()
                .id(10L)
                .bookId(1L)
                .studentId(2L)
                .status(IssueStatus.RETURNED)
                .returnDate(LocalDate.now())
                .build();

        when(libraryService.returnBook(10L)).thenReturn(response);

        mockMvc.perform(post("/api/v1/enterprise-ops/library/issues/10/return"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETURNED"));
    }

    @Test
    @WithMockUser(roles = "TRANSPORT_MANAGER")
    @DisplayName("POST /api/v1/enterprise-ops/transport/vehicles returns 201 Created")
    void shouldCreateVehicle() throws Exception {
        VehicleRequestDTO request = VehicleRequestDTO.builder()
                .registrationNumber("KA-01-EQ-9876")
                .capacity(45)
                .driverName("Robert Vance")
                .build();

        VehicleResponseDTO response = VehicleResponseDTO.builder()
                .id(5L)
                .registrationNumber("KA-01-EQ-9876")
                .capacity(45)
                .driverName("Robert Vance")
                .build();

        when(transportService.createVehicle(any(VehicleRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/enterprise-ops/transport/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5L))
                .andExpect(jsonPath("$.registrationNumber").value("KA-01-EQ-9876"));
    }

    @Test
    @WithMockUser(roles = "TRANSPORT_MANAGER")
    @DisplayName("GET /api/v1/enterprise-ops/transport/routes returns 200 OK with capacityDisplay")
    void shouldGetRoutes() throws Exception {
        RouteResponseDTO route = RouteResponseDTO.builder()
                .id(12L)
                .routeName("Campus Line")
                .capacityDisplay("42/50 Seats Filled")
                .assignedCount(42L)
                .monthlyFee(new BigDecimal("120.00"))
                .build();

        when(transportService.getAllRoutes()).thenReturn(List.of(route));

        mockMvc.perform(get("/api/v1/enterprise-ops/transport/routes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].routeName").value("Campus Line"))
                .andExpect(jsonPath("$[0].capacityDisplay").value("42/50 Seats Filled"));
    }
}
