package com.edupulse.core.api.rest;

import com.edupulse.core.domain.student.EnrollmentStatus;
import com.edupulse.core.domain.student.dto.StudentRequestDTO;
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
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@org.springframework.test.context.TestPropertySource(properties = "edupulse.core.student-controller.enabled=true")
@ContextConfiguration(classes = {
        StudentController.class,
        StudentControllerTest.SecurityTestConfig.class
})
class StudentControllerTest {

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

    @MockBean(name = "coreStudentService")
    private StudentService studentService;

    @Test
    @WithMockUser(username = "admissions_officer", roles = {"ADMISSIONS_OFFICER"})
    @DisplayName("POST /api/v1/students succeeds with 201 for ROLE_ADMISSIONS_OFFICER")
    void enrollStudent_withAdmissionsOfficer_returnsCreated() throws Exception {
        StudentRequestDTO request = StudentRequestDTO.builder()
                .enrollmentNumber("CS-2026-001")
                .firstName("Marie")
                .lastName("Curie")
                .email("marie.curie@institution.edu")
                .departmentId(1L)
                .batchId(2L)
                .status(EnrollmentStatus.ACTIVE)
                .build();

        StudentResponseDTO response = StudentResponseDTO.builder()
                .id(10L)
                .enrollmentNumber("CS-2026-001")
                .firstName("Marie")
                .lastName("Curie")
                .email("marie.curie@institution.edu")
                .tenantId("tenant-radium")
                .departmentId(1L)
                .departmentName("Physics")
                .batchId(2L)
                .academicYear("2026-2027")
                .status(EnrollmentStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        when(studentService.enrollNewStudent(any(StudentRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.enrollmentNumber").value("CS-2026-001"))
                .andExpect(jsonPath("$.firstName").value("Marie"))
                .andExpect(jsonPath("$.tenantId").value("tenant-radium"));
    }

    @Test
    @WithMockUser(username = "super_admin", roles = {"SUPERADMIN"})
    @DisplayName("GET /api/v1/students/{id} succeeds with 200 for ROLE_SUPERADMIN")
    void getStudentById_withSuperAdmin_returnsOk() throws Exception {
        StudentResponseDTO response = StudentResponseDTO.builder()
                .id(25L)
                .enrollmentNumber("CS-2026-025")
                .firstName("Nikola")
                .lastName("Tesla")
                .email("nikola.tesla@institution.edu")
                .tenantId("tenant-energy")
                .status(EnrollmentStatus.ACTIVE)
                .build();

        when(studentService.getStudentById(25L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/students/25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(25L))
                .andExpect(jsonPath("$.firstName").value("Nikola"));
    }

    @Test
    @WithMockUser(username = "student_user", roles = {"STUDENT"})
    @DisplayName("POST /api/v1/students is blocked with 403 for unauthorized ROLE_STUDENT")
    void enrollStudent_withStudentRole_returnsForbidden() throws Exception {
        StudentRequestDTO request = StudentRequestDTO.builder()
                .enrollmentNumber("CS-2026-099")
                .firstName("Unauthorized")
                .lastName("User")
                .email("unauthorized@institution.edu")
                .departmentId(1L)
                .batchId(2L)
                .build();

        mockMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "faculty_user", roles = {"FACULTY"})
    @DisplayName("GET /api/v1/students/{id} is blocked with 403 for unauthorized ROLE_FACULTY")
    void getStudentById_withFacultyRole_returnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/students/99"))
                .andExpect(status().isForbidden());
    }
}
