package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.academic.dto.ExamDefinitionDTO;
import com.edupulse.core.domain.academic.dto.ExamQuestionDTO;
import com.edupulse.core.domain.academic.dto.ExamResponseDTO;
import com.edupulse.core.domain.academic.repository.BatchRepository;
import com.edupulse.core.domain.academic.repository.CourseOfferingRepository;
import com.edupulse.core.domain.academic.repository.CourseRepository;
import com.edupulse.core.domain.academic.repository.DepartmentRepository;
import com.edupulse.core.domain.academic.repository.ExamQuestionRepository;
import com.edupulse.core.domain.academic.repository.ExamRepository;
import com.edupulse.core.domain.academic.repository.FacultyRepository;
import com.edupulse.core.domain.academic.service.AcademicServiceImpl;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.erp.common.exception.EduPulseBusinessException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ExamDomainRbacTest {

    private static final String TENANT_ID = "tenant-univ-01";

    private FacultyRepository facultyRepository;
    private CourseRepository courseRepository;
    private CourseOfferingRepository courseOfferingRepository;
    private DepartmentRepository departmentRepository;
    private BatchRepository batchRepository;
    private ExamRepository examRepository;
    private ExamQuestionRepository examQuestionRepository;
    private StudentRepository studentRepository;
    private AcademicServiceImpl academicService;

    @BeforeEach
    void setUp() {
        facultyRepository = mock(FacultyRepository.class);
        courseRepository = mock(CourseRepository.class);
        courseOfferingRepository = mock(CourseOfferingRepository.class);
        departmentRepository = mock(DepartmentRepository.class);
        batchRepository = mock(BatchRepository.class);
        examRepository = mock(ExamRepository.class);
        examQuestionRepository = mock(ExamQuestionRepository.class);
        studentRepository = mock(StudentRepository.class);

        academicService = new AcademicServiceImpl(
                facultyRepository,
                courseRepository,
                courseOfferingRepository,
                departmentRepository,
                batchRepository,
                examRepository,
                examQuestionRepository,
                studentRepository
        );
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("ACADEMIC_ADMIN or FACULTY can create an exam with duration, marks, and questions")
    void shouldAllowFacultyToCreateExam() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("faculty1", "pass", List.of(new SimpleGrantedAuthority("ROLE_FACULTY")))
        );

        Course course = new Course();
        course.setId(101L);
        course.setCode("CS-301");
        course.setName("Operating Systems");

        CourseOffering offering = new CourseOffering();
        offering.setId(201L);
        offering.setCourse(course);

        when(courseOfferingRepository.findByIdAndTenantId(201L, TENANT_ID)).thenReturn(Optional.of(offering));
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam e = invocation.getArgument(0);
            e.setId(501L);
            return e;
        });

        ExamDefinitionDTO request = ExamDefinitionDTO.builder()
                .title("Midterm Assessment")
                .courseOfferingId(201L)
                .scheduledStartTime(LocalDateTime.of(2026, 11, 20, 10, 0))
                .durationMinutes(90)
                .maxMarks(new BigDecimal("100.00"))
                .passingMarks(new BigDecimal("40.00"))
                .status(ExamStatus.DRAFT)
                .questions(List.of(
                        ExamQuestionDTO.builder()
                                .questionText("What is a semaphore?")
                                .marks(new BigDecimal("10.00"))
                                .orderIndex(1)
                                .build()
                ))
                .build();

        ExamResponseDTO response = academicService.createExam(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(501L);
        assertThat(response.getTitle()).isEqualTo("Midterm Assessment");
        assertThat(response.getDurationMinutes()).isEqualTo(90);
        assertThat(response.getStatus()).isEqualTo(ExamStatus.DRAFT);
        assertThat(response.getQuestions()).hasSize(1);
    }

    @Test
    @DisplayName("STUDENT role is blocked from creating an exam with 403 Forbidden")
    void shouldBlockStudentFromCreatingExam() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("student1@edupulse.io", "pass", List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
        );

        ExamDefinitionDTO request = ExamDefinitionDTO.builder()
                .title("Unauthorized Exam")
                .scheduledStartTime(LocalDateTime.now().plusDays(1))
                .durationMinutes(60)
                .maxMarks(new BigDecimal("50.00"))
                .passingMarks(new BigDecimal("20.00"))
                .build();

        assertThatThrownBy(() -> academicService.createExam(request))
                .isInstanceOf(EduPulseBusinessException.class)
                .hasMessageContaining("Students are not authorized to create exams")
                .satisfies(ex -> assertThat(((EduPulseBusinessException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("STUDENT role can only read PUBLISHED exams for enrolled courses")
    void shouldAllowStudentToReadPublishedEnrolledExams() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("student@univ.edu", "pass", List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
        );

        Batch batch = new Batch();
        batch.setId(77L);

        Student student = new Student();
        student.setId(10L);
        student.setEmail("student@univ.edu");
        student.setBatch(batch);

        Course courseA = new Course();
        courseA.setId(101L);

        CourseOffering offeringA = new CourseOffering();
        offeringA.setId(201L);
        offeringA.setCourse(courseA);
        offeringA.setBatch(batch);

        Exam publishedExam = Exam.builder()
                .title("Operating Systems Final")
                .status(ExamStatus.PUBLISHED)
                .courseOffering(offeringA)
                .courseId(101L)
                .scheduledStartTime(LocalDateTime.of(2026, 12, 1, 9, 0))
                .durationMinutes(120)
                .maxMarks(new BigDecimal("100.00"))
                .passingMarks(new BigDecimal("40.00"))
                .build();
        publishedExam.setId(901L);

        when(studentRepository.findByEmailAndTenantId("student@univ.edu", TENANT_ID)).thenReturn(Optional.of(student));
        when(courseOfferingRepository.findByBatchIdAndTenantId(77L, TENANT_ID)).thenReturn(List.of(offeringA));
        when(examRepository.findPublishedExamsForCourses(List.of(101L), ExamStatus.PUBLISHED, TENANT_ID))
                .thenReturn(List.of(publishedExam));

        List<ExamResponseDTO> exams = academicService.getPublishedExamsForStudent(null, null);

        assertThat(exams).hasSize(1);
        assertThat(exams.get(0).getId()).isEqualTo(901L);
        assertThat(exams.get(0).getStatus()).isEqualTo(ExamStatus.PUBLISHED);
    }

    @Test
    @DisplayName("STUDENT querying exams for an unenrolled course is rejected with 403 Forbidden")
    void shouldRejectStudentQueryingUnenrolledCourse() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("student@univ.edu", "pass", List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
        );

        Batch batch = new Batch();
        batch.setId(77L);

        Student student = new Student();
        student.setId(10L);
        student.setEmail("student@univ.edu");
        student.setBatch(batch);

        Course courseA = new Course();
        courseA.setId(101L);

        CourseOffering offeringA = new CourseOffering();
        offeringA.setCourse(courseA);

        when(studentRepository.findByEmailAndTenantId("student@univ.edu", TENANT_ID)).thenReturn(Optional.of(student));
        when(courseOfferingRepository.findByBatchIdAndTenantId(77L, TENANT_ID)).thenReturn(List.of(offeringA));

        assertThatThrownBy(() -> academicService.getPublishedExamsForStudent(null, 999L))
                .isInstanceOf(EduPulseBusinessException.class)
                .hasMessageContaining("Student is not enrolled in course ID 999")
                .satisfies(ex -> assertThat(((EduPulseBusinessException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("STUDENT querying an unpublished DRAFT exam by ID is rejected with 403 Forbidden")
    void shouldRejectStudentQueryingDraftExam() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("student@univ.edu", "pass", List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
        );

        Exam draftExam = Exam.builder()
                .title("Draft Exam")
                .status(ExamStatus.DRAFT)
                .build();
        draftExam.setId(555L);

        when(examRepository.findByIdAndTenantId(555L, TENANT_ID)).thenReturn(Optional.of(draftExam));

        assertThatThrownBy(() -> academicService.getExamById(555L))
                .isInstanceOf(EduPulseBusinessException.class)
                .hasMessageContaining("Exam is not published")
                .satisfies(ex -> assertThat(((EduPulseBusinessException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }
}
