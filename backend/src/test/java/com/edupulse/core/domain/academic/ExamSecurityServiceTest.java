package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.academic.dto.ExamStartRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamStartResponseDTO;
import com.edupulse.core.domain.academic.repository.CourseOfferingRepository;
import com.edupulse.core.domain.academic.repository.ExamQuestionRepository;
import com.edupulse.core.domain.academic.repository.ExamRepository;
import com.edupulse.core.domain.academic.repository.ExamSubmissionRepository;
import com.edupulse.core.domain.academic.service.ExamSecurityServiceImpl;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.erp.common.exception.EduPulseBusinessException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
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

class ExamSecurityServiceTest {

    private static final String TENANT_ID = "tenant-lab-01";

    private ExamRepository examRepository;
    private ExamQuestionRepository examQuestionRepository;
    private ExamSubmissionRepository examSubmissionRepository;
    private StudentRepository studentRepository;
    private CourseOfferingRepository courseOfferingRepository;
    private ExamSecurityServiceImpl examSecurityService;

    @BeforeEach
    void setUp() {
        examRepository = mock(ExamRepository.class);
        examQuestionRepository = mock(ExamQuestionRepository.class);
        examSubmissionRepository = mock(ExamSubmissionRepository.class);
        studentRepository = mock(StudentRepository.class);
        courseOfferingRepository = mock(CourseOfferingRepository.class);

        examSecurityService = new ExamSecurityServiceImpl(
                examRepository,
                examQuestionRepository,
                examSubmissionRepository,
                studentRepository,
                courseOfferingRepository
        );
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("CIDR subnet evaluation allows matching IPs and rejects non-matching IPs")
    void shouldEvaluateSubnetMatching() {
        String labSubnet = "192.168.1.0/24, 10.20.0.0/16";

        assertThat(examSecurityService.isIpInSubnet("192.168.1.55", labSubnet)).isTrue();
        assertThat(examSecurityService.isIpInSubnet("192.168.1.1", labSubnet)).isTrue();
        assertThat(examSecurityService.isIpInSubnet("10.20.5.99", labSubnet)).isTrue();

        assertThat(examSecurityService.isIpInSubnet("192.168.2.1", labSubnet)).isFalse();
        assertThat(examSecurityService.isIpInSubnet("172.16.0.1", labSubnet)).isFalse();
    }

    @Test
    @DisplayName("validateExamAccess succeeds when IP and dynamic examPin are correct")
    void shouldValidateExamAccessSuccessfully() {
        Exam exam = Exam.builder()
                .title("Database Systems Midterm")
                .allowedIpSubnet("192.168.10.0/24")
                .examPin("CS-LAB-992")
                .build();
        exam.setId(101L);

        // Should execute cleanly without throwing
        examSecurityService.validateExamAccess(exam, "192.168.10.45", "CS-LAB-992");
    }

    @Test
    @DisplayName("validateExamAccess throws 403 Forbidden when client IP is outside authorized subnet")
    void shouldRejectWhenIpOutsideSubnet() {
        Exam exam = Exam.builder()
                .title("Operating Systems Quiz")
                .allowedIpSubnet("192.168.50.0/24")
                .examPin("PIN123")
                .build();
        exam.setId(102L);

        assertThatThrownBy(() -> examSecurityService.validateExamAccess(exam, "10.0.0.12", "PIN123"))
                .isInstanceOf(EduPulseBusinessException.class)
                .hasMessageContaining("not within the authorized institutional computer lab subnet")
                .satisfies(ex -> assertThat(((EduPulseBusinessException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("validateExamAccess throws 403 Forbidden when dynamic exam PIN is incorrect")
    void shouldRejectWhenPinIsInvalid() {
        Exam exam = Exam.builder()
                .title("Networking Assessment")
                .allowedIpSubnet("192.168.1.0/24")
                .examPin("SECRET-PIN-77")
                .build();
        exam.setId(103L);

        assertThatThrownBy(() -> examSecurityService.validateExamAccess(exam, "192.168.1.15", "WRONG_PIN"))
                .isInstanceOf(EduPulseBusinessException.class)
                .hasMessageContaining("Invalid exam PIN provided")
                .satisfies(ex -> assertThat(((EduPulseBusinessException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("extractClientIp extracts first address from X-Forwarded-For header")
    void shouldExtractClientIpFromProxyChain() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "192.168.1.120, 10.0.0.1, 172.16.0.2");
        request.setRemoteAddr("127.0.0.1");

        String resolvedIp = examSecurityService.extractClientIp(request);
        assertThat(resolvedIp).isEqualTo("192.168.1.120");
    }

    @Test
    @DisplayName("startExam commences exam session, creates ExamSubmission, and returns questions")
    void shouldStartExamSuccessfully() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("student@univ.edu", "pass", List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
        );

        Batch batch = new Batch();
        batch.setId(5L);

        Student student = new Student();
        student.setId(22L);
        student.setEmail("student@univ.edu");
        student.setBatch(batch);

        Course course = new Course();
        course.setId(50L);

        CourseOffering offering = new CourseOffering();
        offering.setCourse(course);

        Exam exam = Exam.builder()
                .title("Algorithms Final")
                .status(ExamStatus.PUBLISHED)
                .courseId(50L)
                .durationMinutes(120)
                .allowedIpSubnet("192.168.1.0/24")
                .examPin("ALGO-884")
                .build();
        exam.setId(201L);

        ExamQuestion question = ExamQuestion.builder()
                .questionText("Analyze QuickSort worst case")
                .marks(new BigDecimal("15.00"))
                .orderIndex(1)
                .build();
        question.setId(301L);

        when(examRepository.findByIdAndTenantId(201L, TENANT_ID)).thenReturn(Optional.of(exam));
        when(studentRepository.findByEmailAndTenantId("student@univ.edu", TENANT_ID)).thenReturn(Optional.of(student));
        when(courseOfferingRepository.findByBatchIdAndTenantId(5L, TENANT_ID)).thenReturn(List.of(offering));
        when(examSubmissionRepository.findByExamIdAndStudentIdAndTenantId(201L, 22L, TENANT_ID)).thenReturn(Optional.empty());
        when(examSubmissionRepository.save(any(ExamSubmission.class))).thenAnswer(invocation -> {
            ExamSubmission s = invocation.getArgument(0);
            s.setId(401L);
            return s;
        });
        when(examQuestionRepository.findByExamIdAndTenantIdOrderByOrderIndexAsc(201L, TENANT_ID)).thenReturn(List.of(question));

        ExamStartRequestDTO request = ExamStartRequestDTO.builder()
                .examPin("ALGO-884")
                .build();

        ExamStartResponseDTO response = examSecurityService.startExam(201L, request, "192.168.1.44");

        assertThat(response).isNotNull();
        assertThat(response.getSubmissionId()).isEqualTo(401L);
        assertThat(response.getExamId()).isEqualTo(201L);
        assertThat(response.getClientIp()).isEqualTo("192.168.1.44");
        assertThat(response.getStatus()).isEqualTo("STARTED");
        assertThat(response.getQuestions()).hasSize(1);
        assertThat(response.getQuestions().get(0).getQuestionText()).isEqualTo("Analyze QuickSort worst case");
    }
}
