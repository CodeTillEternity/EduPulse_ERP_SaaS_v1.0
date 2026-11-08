package com.edupulse.core.api.rest;

import com.edupulse.core.domain.academic.dto.ExamRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamResponseDTO;
import com.edupulse.core.domain.academic.dto.GradeScaleDTO;
import com.edupulse.core.domain.academic.dto.GradeScaleResponseDTO;
import com.edupulse.core.domain.academic.dto.ResultRequestDTO;
import com.edupulse.core.domain.academic.dto.ResultResponseDTO;
import com.edupulse.core.domain.academic.dto.StudentTranscriptDTO;
import com.edupulse.core.domain.academic.service.ExamService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@ContextConfiguration(classes = {
        ExamController.class,
        ExamControllerTest.SecurityTestConfig.class
})
class ExamControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean(name = "coreExamService")
    private ExamService examService;

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
    @WithMockUser(roles = "ACADEMIC_ADMIN")
    @DisplayName("POST /api/v1/academic/exams schedules a new exam")
    void shouldCreateExam() throws Exception {
        ExamRequestDTO request = new ExamRequestDTO(
                "Midterm 1",
                LocalDate.of(2026, 10, 20),
                new BigDecimal("100.00"),
                100L
        );

        ExamResponseDTO response = ExamResponseDTO.builder()
                .id(1L)
                .name("Midterm 1")
                .examDate(request.getExamDate())
                .totalMarks(request.getTotalMarks())
                .courseCode("CS-101")
                .courseName("Computer Science")
                .build();

        when(examService.createExam(any(ExamRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/academic/exams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Midterm 1"))
                .andExpect(jsonPath("$.courseCode").value("CS-101"));
    }

    @Test
    @WithMockUser(roles = "ACADEMIC_ADMIN")
    @DisplayName("POST /api/v1/academic/grade-scales defines a new grading bracket")
    void shouldDefineGradeScale() throws Exception {
        GradeScaleDTO request = new GradeScaleDTO(
                "A",
                new BigDecimal("90.00"),
                new BigDecimal("100.00"),
                new BigDecimal("4.00")
        );

        GradeScaleResponseDTO response = GradeScaleResponseDTO.builder()
                .id(5L)
                .grade("A")
                .minMarks(request.getMinMarks())
                .maxMarks(request.getMaxMarks())
                .gradePoint(request.getGradePoint())
                .build();

        when(examService.defineGradeScale(any(GradeScaleDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/academic/grade-scales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.grade").value("A"))
                .andExpect(jsonPath("$.gradePoint").value(4.00));
    }

    @Test
    @WithMockUser(roles = "FACULTY")
    @DisplayName("POST /api/v1/academic/exams/{id}/results records student grades")
    void shouldRecordStudentResults() throws Exception {
        ResultRequestDTO req = new ResultRequestDTO(10L, new BigDecimal("95.00"), "Excellent");

        ResultResponseDTO res = ResultResponseDTO.builder()
                .id(101L)
                .examId(1L)
                .studentId(10L)
                .studentName("Ada Lovelace")
                .marksObtained(new BigDecimal("95.00"))
                .gradeLabel("A+")
                .gradePoint(new BigDecimal("4.00"))
                .remarks("Excellent")
                .build();

        when(examService.recordStudentResults(eq(1L), any())).thenReturn(List.of(res));

        mockMvc.perform(post("/api/v1/academic/exams/1/results")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(req))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101))
                .andExpect(jsonPath("$[0].gradeLabel").value("A+"))
                .andExpect(jsonPath("$[0].gradePoint").value(4.00));
    }

    @Test
    @WithMockUser(roles = "ACADEMIC_ADMIN")
    @DisplayName("GET /api/v1/academic/transcripts/{enrollmentNumber} returns student transcript")
    void shouldGetStudentTranscript() throws Exception {
        StudentTranscriptDTO transcript = StudentTranscriptDTO.builder()
                .studentId(10L)
                .enrollmentNumber("ENR-001")
                .studentName("Ada Lovelace")
                .cumulativeGpa(new BigDecimal("3.85"))
                .totalExams(4)
                .results(List.of())
                .build();

        when(examService.getStudentTranscript("ENR-001")).thenReturn(transcript);

        mockMvc.perform(get("/api/v1/academic/transcripts/ENR-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enrollmentNumber").value("ENR-001"))
                .andExpect(jsonPath("$.studentName").value("Ada Lovelace"))
                .andExpect(jsonPath("$.cumulativeGpa").value(3.85));
    }
}
