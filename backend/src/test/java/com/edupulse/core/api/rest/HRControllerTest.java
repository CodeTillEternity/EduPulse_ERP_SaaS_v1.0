package com.edupulse.core.api.rest;

import com.edupulse.core.domain.hr.LeaveStatus;
import com.edupulse.core.domain.hr.PayrollStatus;
import com.edupulse.core.domain.hr.dto.LeaveRequestDTO;
import com.edupulse.core.domain.hr.dto.LeaveResponseDTO;
import com.edupulse.core.domain.hr.dto.LeaveReviewDTO;
import com.edupulse.core.domain.hr.dto.MonthlyPayrollRequestDTO;
import com.edupulse.core.domain.hr.dto.PayrollResponseDTO;
import com.edupulse.core.domain.hr.service.HRService;
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
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@ContextConfiguration(classes = {
        HRController.class,
        HRControllerTest.SecurityTestConfig.class
})
class HRControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean(name = "coreHRService")
    private HRService hrService;

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
    @WithMockUser(roles = "HR_MANAGER")
    @DisplayName("POST /api/v1/hr/leaves applies for leave")
    void shouldApplyForLeave() throws Exception {
        LeaveRequestDTO request = new LeaveRequestDTO(
                10L,
                LocalDate.of(2026, 11, 10),
                LocalDate.of(2026, 11, 14),
                "Conference attendance"
        );

        LeaveResponseDTO response = LeaveResponseDTO.builder()
                .id(1L)
                .facultyId(10L)
                .facultyName("Alan Turing")
                .employeeId("FAC-001")
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .daysCount(5)
                .reason(request.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        when(hrService.applyForLeave(any(LeaveRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/hr/leaves")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.facultyName").value("Alan Turing"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.daysCount").value(5));
    }

    @Test
    @WithMockUser(roles = "HR_MANAGER")
    @DisplayName("PUT /api/v1/hr/leaves/{id}/review reviews leave")
    void shouldReviewLeave() throws Exception {
        LeaveReviewDTO reviewDTO = new LeaveReviewDTO(LeaveStatus.APPROVED, "Approved by HR", "HR Admin");

        LeaveResponseDTO response = LeaveResponseDTO.builder()
                .id(1L)
                .facultyId(10L)
                .facultyName("Alan Turing")
                .status(LeaveStatus.APPROVED)
                .reviewedBy("HR Admin")
                .reviewNotes("Approved by HR")
                .reviewedAt(LocalDateTime.now())
                .build();

        when(hrService.reviewLeave(eq(1L), any(LeaveReviewDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/hr/leaves/1/review")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.reviewedBy").value("HR Admin"));
    }

    @Test
    @WithMockUser(roles = "HR_MANAGER")
    @DisplayName("GET /api/v1/hr/leaves/pending returns pending leave requests")
    void shouldGetPendingLeaves() throws Exception {
        LeaveResponseDTO leave = LeaveResponseDTO.builder()
                .id(2L)
                .facultyId(10L)
                .facultyName("Alan Turing")
                .status(LeaveStatus.PENDING)
                .build();

        when(hrService.getPendingLeaves()).thenReturn(List.of(leave));

        mockMvc.perform(get("/api/v1/hr/leaves/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    @WithMockUser(roles = "HR_MANAGER")
    @DisplayName("POST /api/v1/hr/payroll/generate generates payroll")
    void shouldGeneratePayroll() throws Exception {
        MonthlyPayrollRequestDTO request = new MonthlyPayrollRequestDTO(11, 2026, new BigDecimal("60000.00"));

        PayrollResponseDTO payslip = PayrollResponseDTO.builder()
                .id(100L)
                .facultyId(10L)
                .facultyName("Alan Turing")
                .month(11)
                .year(2026)
                .baseSalary(new BigDecimal("60000.00"))
                .deductions(new BigDecimal("4000.00"))
                .netSalary(new BigDecimal("56000.00"))
                .status(PayrollStatus.GENERATED)
                .build();

        when(hrService.generateMonthlyPayroll(any(MonthlyPayrollRequestDTO.class))).thenReturn(List.of(payslip));

        mockMvc.perform(post("/api/v1/hr/payroll/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].netSalary").value(56000.00))
                .andExpect(jsonPath("$[0].status").value("GENERATED"));
    }

    @Test
    @WithMockUser(roles = "HR_MANAGER")
    @DisplayName("PUT /api/v1/hr/payroll/{id}/pay marks payslip as paid")
    void shouldMarkPayrollAsPaid() throws Exception {
        PayrollResponseDTO paidPayslip = PayrollResponseDTO.builder()
                .id(100L)
                .facultyId(10L)
                .facultyName("Alan Turing")
                .month(11)
                .year(2026)
                .netSalary(new BigDecimal("56000.00"))
                .status(PayrollStatus.PAID)
                .paymentDate(LocalDate.now())
                .build();

        when(hrService.markPayrollAsPaid(100L)).thenReturn(paidPayslip);

        mockMvc.perform(put("/api/v1/hr/payroll/100/pay"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.paymentDate").isNotEmpty());
    }
}
