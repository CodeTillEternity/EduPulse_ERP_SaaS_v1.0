package com.edupulse.core.api.rest;

import com.edupulse.core.domain.academic.dto.StudentTranscriptDTO;
import com.edupulse.core.domain.academic.service.ExamService;
import com.edupulse.core.domain.finance.InvoiceStatus;
import com.edupulse.core.domain.finance.dto.StudentInvoiceResponseDTO;
import com.edupulse.core.domain.finance.service.FinanceService;
import com.edupulse.core.domain.operations.dto.TimetableResponseDTO;
import com.edupulse.core.domain.operations.service.OperationsService;
import com.edupulse.core.domain.student.EnrollmentStatus;
import com.edupulse.core.domain.student.dto.StudentResponseDTO;
import com.edupulse.core.domain.student.service.StudentService;
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
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@ContextConfiguration(classes = {
        StudentPortalController.class,
        StudentPortalControllerTest.SecurityTestConfig.class
})
class StudentPortalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean(name = "coreOperationsService")
    private OperationsService operationsService;

    @MockBean(name = "coreFinanceService")
    private FinanceService financeService;

    @MockBean(name = "coreExamService")
    private ExamService examService;

    @MockBean(name = "coreStudentService")
    private StudentService studentService;

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
    @DisplayName("GET /api/v1/portal/dashboard/me returns aggregated metrics for authenticated student")
    @WithMockUser(username = "STU-2026-001", roles = {"STUDENT"})
    void shouldReturnDashboardSnapshotForStudent() throws Exception {
        StudentResponseDTO student = StudentResponseDTO.builder()
                .id(100L)
                .enrollmentNumber("STU-2026-001")
                .firstName("Rohan")
                .lastName("Verma")
                .email("rohan.verma@edupulse.edu")
                .batchId(20L)
                .academicYear("2025-2026")
                .departmentName("Computer Science")
                .status(EnrollmentStatus.ACTIVE)
                .tenantId("default")
                .build();

        String currentDayOfWeek = LocalDate.now().getDayOfWeek().name();

        TimetableResponseDTO class1 = TimetableResponseDTO.builder()
                .id(1L)
                .courseCode("CS101")
                .courseName("Data Structures")
                .dayOfWeek(currentDayOfWeek)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .roomNumber("Lab 301")
                .build();

        StudentInvoiceResponseDTO invoice1 = StudentInvoiceResponseDTO.builder()
                .id(501L)
                .invoiceNumber("INV-2026-0001")
                .grossAmount(new BigDecimal("25000.00"))
                .netAmount(new BigDecimal("25000.00"))
                .amountPaid(BigDecimal.ZERO)
                .outstandingBalance(new BigDecimal("25000.00"))
                .status(InvoiceStatus.UNPAID)
                .build();

        StudentTranscriptDTO transcript = StudentTranscriptDTO.builder()
                .studentId(100L)
                .enrollmentNumber("STU-2026-001")
                .cumulativeGpa(new BigDecimal("3.85"))
                .build();

        when(studentService.getStudentByEnrollmentNumber(eq("STU-2026-001")))
                .thenReturn(student);
        when(operationsService.getTimetableByBatch(eq(20L)))
                .thenReturn(List.of(class1));
        when(financeService.getInvoicesByStudent(eq(100L)))
                .thenReturn(List.of(invoice1));
        when(examService.getStudentTranscript(eq("STU-2026-001")))
                .thenReturn(transcript);

        mockMvc.perform(get("/api/v1/portal/dashboard/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value(100))
                .andExpect(jsonPath("$.studentName").value("Rohan Verma"))
                .andExpect(jsonPath("$.enrollmentNumber").value("STU-2026-001"))
                .andExpect(jsonPath("$.cumulativeGpa").value(3.85))
                .andExpect(jsonPath("$.todayClasses[0].courseCode").value("CS101"))
                .andExpect(jsonPath("$.unpaidInvoices[0].invoiceNumber").value("INV-2026-0001"))
                .andExpect(jsonPath("$.totalUnpaidAmount").value(25000.00));
    }

    @Test
    @DisplayName("GET /api/v1/portal/dashboard/me returns 404 when student profile is not found")
    @WithMockUser(username = "UNKNOWN_STU", roles = {"STUDENT"})
    void shouldReturn404WhenStudentNotFound() throws Exception {
        when(studentService.getStudentByEnrollmentNumber(any()))
                .thenThrow(new IllegalArgumentException("Student not found"));
        when(studentService.getStudentByEmail(any()))
                .thenThrow(new IllegalArgumentException("Student not found"));

        mockMvc.perform(get("/api/v1/portal/dashboard/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
