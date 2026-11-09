package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.academic.dto.ExamAnswerDTO;
import com.edupulse.core.domain.academic.dto.ExamSubmissionRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamSubmissionResponseDTO;
import com.edupulse.core.domain.academic.repository.ExamQuestionRepository;
import com.edupulse.core.domain.academic.repository.ExamRepository;
import com.edupulse.core.domain.academic.repository.ExamSubmissionRepository;
import com.edupulse.core.domain.academic.service.SebConfigurationServiceImpl;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.erp.common.exception.EduPulseBusinessException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SebConfigurationServiceTest {

    private static final String TENANT_ID = "tenant-seb-01";
    private static final String SEB_KEY = "3c847d89f81a4d9ab9c1938501234567";

    private ExamRepository examRepository;
    private ExamQuestionRepository examQuestionRepository;
    private ExamSubmissionRepository examSubmissionRepository;
    private StudentRepository studentRepository;
    private ObjectMapper objectMapper;
    private SebConfigurationServiceImpl sebConfigurationService;

    @BeforeEach
    void setUp() {
        examRepository = mock(ExamRepository.class);
        examQuestionRepository = mock(ExamQuestionRepository.class);
        examSubmissionRepository = mock(ExamSubmissionRepository.class);
        studentRepository = mock(StudentRepository.class);
        objectMapper = new ObjectMapper();

        sebConfigurationService = new SebConfigurationServiceImpl(
                examRepository,
                examQuestionRepository,
                examSubmissionRepository,
                studentRepository,
                objectMapper
        );
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("generateSebConfigXml builds XML with startURL and lockdown settings (dual monitors, clipboard, background apps disabled)")
    void shouldGenerateValidSebXmlConfig() {
        Exam exam = Exam.builder()
                .title("Operating Systems Final Exam")
                .sebConfigKey(SEB_KEY)
                .build();
        exam.setId(42L);

        String xml = sebConfigurationService.generateSebConfigXml(exam, "https://exams.edupulse.org");

        assertThat(xml).contains("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
        assertThat(xml).contains("<key>startURL</key>");
        assertThat(xml).contains("<string>https://exams.edupulse.org/api/exams/42/start</string>");
        assertThat(xml).contains("<key>sebConfigKey</key>");
        assertThat(xml).contains("<string>" + SEB_KEY + "</string>");

        // Verify OS Lockdown Settings
        assertThat(xml).contains("<key>allowSwitchToApplications</key>\n    <false/>");
        assertThat(xml).contains("<key>allowClipboard</key>\n    <false/>");
        assertThat(xml).contains("<key>allowDualMonitors</key>\n    <false/>");
        assertThat(xml).contains("<key>enableMultipleMonitors</key>\n    <false/>");
        assertThat(xml).contains("<key>allowQuit</key>\n    <false/>");
    }

    @Test
    @DisplayName("validateSebRequestHash passes when X-SafeExamBrowser-RequestHash matches SHA-256 hash")
    void shouldValidateCorrectSebHash() {
        String submitUrl = "https://exams.edupulse.org/api/exams/42/submit";
        String expectedHash = sebConfigurationService.computeExpectedRequestHash(submitUrl, SEB_KEY);

        // Should execute cleanly without error
        sebConfigurationService.validateSebRequestHash(submitUrl, SEB_KEY, expectedHash);
    }

    @Test
    @DisplayName("validateSebRequestHash throws 403 Forbidden when hash header is missing")
    void shouldRejectMissingSebHeader() {
        String submitUrl = "https://exams.edupulse.org/api/exams/42/submit";

        assertThatThrownBy(() -> sebConfigurationService.validateSebRequestHash(submitUrl, SEB_KEY, null))
                .isInstanceOf(EduPulseBusinessException.class)
                .hasMessageContaining("Missing X-SafeExamBrowser-RequestHash HTTP header")
                .satisfies(ex -> assertThat(((EduPulseBusinessException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("validateSebRequestHash throws 403 Forbidden when cryptographic hash does not match")
    void shouldRejectTamperedSebHash() {
        String submitUrl = "https://exams.edupulse.org/api/exams/42/submit";

        assertThatThrownBy(() -> sebConfigurationService.validateSebRequestHash(submitUrl, SEB_KEY, "invalid-tampered-hash-signature"))
                .isInstanceOf(EduPulseBusinessException.class)
                .hasMessageContaining("Invalid X-SafeExamBrowser-RequestHash cryptographic signature")
                .satisfies(ex -> assertThat(((EduPulseBusinessException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("submitExam cryptographically verifies SEB environment, calculates marks, and persists submission")
    void shouldSubmitAndGradeExamSuccessfully() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("student@univ.edu", "pass", List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
        );

        Student student = new Student();
        student.setId(10L);
        student.setFirstName("Alice");
        student.setLastName("Smith");
        student.setEmail("student@univ.edu");

        Exam exam = Exam.builder()
                .title("Computer Networks Midterm")
                .sebConfigKey(SEB_KEY)
                .maxMarks(new BigDecimal("20.00"))
                .passingMarks(new BigDecimal("10.00"))
                .status(ExamStatus.PUBLISHED)
                .build();
        exam.setId(88L);

        ExamQuestion q1 = ExamQuestion.builder()
                .questionText("Port of HTTP?")
                .correctAnswer("80")
                .marks(new BigDecimal("10.00"))
                .build();
        q1.setId(101L);

        ExamQuestion q2 = ExamQuestion.builder()
                .questionText("Port of HTTPS?")
                .correctAnswer("443")
                .marks(new BigDecimal("10.00"))
                .build();
        q2.setId(102L);

        when(examRepository.findByIdAndTenantId(88L, TENANT_ID)).thenReturn(Optional.of(exam));
        when(studentRepository.findByEmailAndTenantId("student@univ.edu", TENANT_ID)).thenReturn(Optional.of(student));
        when(examSubmissionRepository.findByExamIdAndStudentIdAndTenantId(88L, 10L, TENANT_ID)).thenReturn(Optional.empty());
        when(examQuestionRepository.findByExamIdAndTenantIdOrderByOrderIndexAsc(88L, TENANT_ID)).thenReturn(List.of(q1, q2));
        when(examSubmissionRepository.save(any(ExamSubmission.class))).thenAnswer(invocation -> {
            ExamSubmission s = invocation.getArgument(0);
            s.setId(999L);
            return s;
        });

        String submitUrl = "https://exams.edupulse.org/api/exams/88/submit";
        String validHash = sebConfigurationService.computeExpectedRequestHash(submitUrl, SEB_KEY);

        ExamSubmissionRequestDTO submissionRequest = ExamSubmissionRequestDTO.builder()
                .answers(List.of(
                        ExamAnswerDTO.builder().questionId(101L).selectedAnswer("80").build(),   // Correct (+10)
                        ExamAnswerDTO.builder().questionId(102L).selectedAnswer("8080").build() // Incorrect (0)
                ))
                .build();

        ExamSubmissionResponseDTO response = sebConfigurationService.submitExam(
                88L, submissionRequest, validHash, submitUrl, "192.168.1.100"
        );

        assertThat(response).isNotNull();
        assertThat(response.getSubmissionId()).isEqualTo(999L);
        assertThat(response.getStudentName()).isEqualTo("Alice Smith");
        assertThat(response.getScore()).isEqualByComparingTo("10.00");
        assertThat(response.getMaxMarks()).isEqualByComparingTo("20.00");
        assertThat(response.isPassed()).isTrue();
        assertThat(response.isSebValidated()).isTrue();
        assertThat(response.getStatus()).isEqualTo("SUBMITTED");
    }
}
