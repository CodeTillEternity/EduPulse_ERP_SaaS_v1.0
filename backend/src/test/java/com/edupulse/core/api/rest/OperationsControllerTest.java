package com.edupulse.core.api.rest;

import com.edupulse.core.domain.operations.AttendanceStatus;
import com.edupulse.core.domain.operations.dto.AttendanceRequestDTO;
import com.edupulse.core.domain.operations.dto.AttendanceResponseDTO;
import com.edupulse.core.domain.operations.dto.TimetableRequestDTO;
import com.edupulse.core.domain.operations.dto.TimetableResponseDTO;
import com.edupulse.core.domain.operations.service.OperationsService;
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

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@ContextConfiguration(classes = {
        OperationsController.class,
        OperationsControllerTest.SecurityTestConfig.class
})
class OperationsControllerTest {

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

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean(name = "coreOperationsService")
    private OperationsService operationsService;

    @Test
    @WithMockUser(username = "faculty_member", roles = {"FACULTY"})
    @DisplayName("POST /api/v1/operations/timetable succeeds with 201 for ROLE_FACULTY")
    void scheduleClass_withFacultyRole_returnsCreated() throws Exception {
        TimetableRequestDTO request = TimetableRequestDTO.builder()
                .courseOfferingId(1L)
                .dayOfWeek("MONDAY")
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .roomNumber("ROOM-301")
                .build();

        TimetableResponseDTO response = TimetableResponseDTO.builder()
                .id(100L)
                .courseOfferingId(1L)
                .courseCode("CS201")
                .courseName("Data Structures")
                .dayOfWeek("MONDAY")
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .roomNumber("ROOM-301")
                .tenantId("tenant-apex")
                .build();

        when(operationsService.scheduleClass(any(TimetableRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/operations/timetable")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.roomNumber").value("ROOM-301"))
                .andExpect(jsonPath("$.courseCode").value("CS201"));
    }

    @Test
    @WithMockUser(username = "student_user", roles = {"STUDENT"})
    @DisplayName("POST /api/v1/operations/timetable is blocked with 403 for unauthorized ROLE_STUDENT")
    void scheduleClass_withStudentRole_returnsForbidden() throws Exception {
        TimetableRequestDTO request = TimetableRequestDTO.builder()
                .courseOfferingId(1L)
                .dayOfWeek("TUESDAY")
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(12, 30))
                .roomNumber("ROOM-102")
                .build();

        mockMvc.perform(post("/api/v1/operations/timetable")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "super_admin", roles = {"SUPERADMIN"})
    @DisplayName("GET /api/v1/operations/timetable/batch/{batchId} succeeds with 200 for ROLE_SUPERADMIN")
    void getTimetableByBatch_withSuperAdmin_returnsOk() throws Exception {
        TimetableResponseDTO entry = TimetableResponseDTO.builder()
                .id(101L)
                .courseCode("MATH101")
                .dayOfWeek("WEDNESDAY")
                .roomNumber("ROOM-201")
                .build();

        when(operationsService.getTimetableByBatch(5L)).thenReturn(List.of(entry));

        mockMvc.perform(get("/api/v1/operations/timetable/batch/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101L))
                .andExpect(jsonPath("$[0].courseCode").value("MATH101"));
    }

    @Test
    @WithMockUser(username = "faculty_user", roles = {"FACULTY"})
    @DisplayName("POST /api/v1/operations/attendance succeeds with 200 for ROLE_FACULTY")
    void markAttendance_withFacultyRole_returnsOk() throws Exception {
        AttendanceRequestDTO request = AttendanceRequestDTO.builder()
                .studentId(20L)
                .timetableEntryId(101L)
                .date(LocalDate.of(2026, 11, 8))
                .status(AttendanceStatus.PRESENT)
                .build();

        AttendanceResponseDTO response = AttendanceResponseDTO.builder()
                .id(1L)
                .studentId(20L)
                .studentName("Ada Lovelace")
                .status(AttendanceStatus.PRESENT)
                .date(LocalDate.of(2026, 11, 8))
                .build();

        when(operationsService.markAttendance(any())).thenReturn(List.of(response));

        mockMvc.perform(post("/api/v1/operations/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(request))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentName").value("Ada Lovelace"))
                .andExpect(jsonPath("$[0].status").value("PRESENT"));
    }
}
