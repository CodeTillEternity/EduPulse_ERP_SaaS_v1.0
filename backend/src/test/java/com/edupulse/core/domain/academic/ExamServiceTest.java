package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.academic.dto.ExamRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamResponseDTO;
import com.edupulse.core.domain.academic.dto.GradeScaleDTO;
import com.edupulse.core.domain.academic.dto.GradeScaleResponseDTO;
import com.edupulse.core.domain.academic.dto.ResultRequestDTO;
import com.edupulse.core.domain.academic.dto.ResultResponseDTO;
import com.edupulse.core.domain.academic.dto.StudentTranscriptDTO;
import com.edupulse.core.domain.academic.repository.CourseOfferingRepository;
import com.edupulse.core.domain.academic.repository.ExamRepository;
import com.edupulse.core.domain.academic.repository.GradeScaleRepository;
import com.edupulse.core.domain.academic.repository.StudentResultRepository;
import com.edupulse.core.domain.academic.service.ExamServiceImpl;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExamServiceTest {

    private static final String TENANT_ID = "tenant-exam-test";

    @Mock
    private ExamRepository examRepository;

    @Mock
    private GradeScaleRepository gradeScaleRepository;

    @Mock
    private StudentResultRepository studentResultRepository;

    @Mock
    private CourseOfferingRepository courseOfferingRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private ExamServiceImpl examService;

    private CourseOffering sampleOffering;
    private Student sampleStudent;
    private Exam sampleExam;
    private GradeScale scaleA;
    private GradeScale scaleB;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);

        Course course = new Course();
        course.setId(10L);
        course.setCode("CS-101");
        course.setName("Intro to Computer Science");

        Faculty faculty = new Faculty();
        faculty.setId(20L);
        faculty.setFirstName("Donald");
        faculty.setLastName("Knuth");

        sampleOffering = new CourseOffering();
        sampleOffering.setId(100L);
        sampleOffering.setCourse(course);
        sampleOffering.setFaculty(faculty);
        sampleOffering.setSemester("Fall 2026");

        sampleStudent = new Student();
        sampleStudent.setId(500L);
        sampleStudent.setEnrollmentNumber("STU-2026-001");
        sampleStudent.setFirstName("Claude");
        sampleStudent.setLastName("Shannon");

        sampleExam = new Exam();
        sampleExam.setId(50L);
        sampleExam.setName("Midterm 1");
        sampleExam.setExamDate(LocalDate.of(2026, 10, 20));
        sampleExam.setTotalMarks(new BigDecimal("100.00"));
        sampleExam.setCourseOffering(sampleOffering);

        scaleA = new GradeScale();
        scaleA.setId(1L);
        scaleA.setGrade("A");
        scaleA.setMinMarks(new BigDecimal("90.00"));
        scaleA.setMaxMarks(new BigDecimal("100.00"));
        scaleA.setGradePoint(new BigDecimal("4.00"));

        scaleB = new GradeScale();
        scaleB.setId(2L);
        scaleB.setGrade("B");
        scaleB.setMinMarks(new BigDecimal("80.00"));
        scaleB.setMaxMarks(new BigDecimal("89.99"));
        scaleB.setGradePoint(new BigDecimal("3.00"));
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("createExam persists exam linked to course offering")
    void shouldCreateExam() {
        ExamRequestDTO dto = new ExamRequestDTO(
                "Midterm 1",
                LocalDate.of(2026, 10, 20),
                new BigDecimal("100.00"),
                100L
        );

        when(courseOfferingRepository.findByIdAndTenantId(100L, TENANT_ID)).thenReturn(Optional.of(sampleOffering));
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam e = invocation.getArgument(0);
            e.setId(50L);
            return e;
        });

        ExamResponseDTO response = examService.createExam(dto);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(50L);
        assertThat(response.getName()).isEqualTo("Midterm 1");
        assertThat(response.getCourseCode()).isEqualTo("CS-101");
        assertThat(response.getFacultyName()).isEqualTo("Donald Knuth");
    }

    @Test
    @DisplayName("defineGradeScale creates and saves grade scale band")
    void shouldDefineGradeScale() {
        GradeScaleDTO dto = new GradeScaleDTO("A+", new BigDecimal("95.00"), new BigDecimal("100.00"), new BigDecimal("4.00"));

        when(gradeScaleRepository.findByGradeAndTenantId("A+", TENANT_ID)).thenReturn(Optional.empty());
        when(gradeScaleRepository.save(any(GradeScale.class))).thenAnswer(invocation -> {
            GradeScale s = invocation.getArgument(0);
            s.setId(10L);
            return s;
        });

        GradeScaleResponseDTO response = examService.defineGradeScale(dto);

        assertThat(response).isNotNull();
        assertThat(response.getGrade()).isEqualTo("A+");
        assertThat(response.getMinMarks()).isEqualByComparingTo("95.00");
        assertThat(response.getGradePoint()).isEqualByComparingTo("4.00");
    }

    @Test
    @DisplayName("recordStudentResults compares marks against GradeScale and auto-calculates grade label & grade point")
    void shouldRecordStudentResultsWithAutoGradeCalculation() {
        when(examRepository.findByIdAndTenantId(50L, TENANT_ID)).thenReturn(Optional.of(sampleExam));
        when(studentRepository.findByIdAndTenantId(500L, TENANT_ID)).thenReturn(Optional.of(sampleStudent));
        when(gradeScaleRepository.findByTenantIdOrderByMinMarksDesc(TENANT_ID)).thenReturn(List.of(scaleA, scaleB));
        when(studentResultRepository.findByExamIdAndStudentIdAndTenantId(50L, 500L, TENANT_ID)).thenReturn(Optional.empty());
        when(studentResultRepository.save(any(StudentResult.class))).thenAnswer(invocation -> {
            StudentResult res = invocation.getArgument(0);
            res.setId(701L);
            return res;
        });

        ResultRequestDTO request = new ResultRequestDTO(500L, new BigDecimal("92.50"), "Outstanding performance");
        List<ResultResponseDTO> results = examService.recordStudentResults(50L, List.of(request));

        assertThat(results).hasSize(1);
        ResultResponseDTO res = results.get(0);
        assertThat(res.getStudentName()).isEqualTo("Claude Shannon");
        assertThat(res.getMarksObtained()).isEqualByComparingTo("92.50");
        // 92.50 is between 90.00 and 100.00 -> Grade A, GradePoint 4.00
        assertThat(res.getGradeLabel()).isEqualTo("A");
        assertThat(res.getGradePoint()).isEqualByComparingTo("4.00");
        assertThat(res.getRemarks()).isEqualTo("Outstanding performance");
    }

    @Test
    @DisplayName("getStudentTranscript compiles all results and calculates cumulative GPA")
    void shouldGenerateStudentTranscriptWithCumulativeGpa() {
        when(studentRepository.findByEnrollmentNumberAndTenantId("STU-2026-001", TENANT_ID)).thenReturn(Optional.of(sampleStudent));

        StudentResult res1 = new StudentResult();
        res1.setId(1L);
        res1.setStudent(sampleStudent);
        res1.setExam(sampleExam);
        res1.setMarksObtained(new BigDecimal("92.00"));
        res1.setGradeLabel("A");
        res1.setGradePoint(new BigDecimal("4.00"));

        StudentResult res2 = new StudentResult();
        res2.setId(2L);
        res2.setStudent(sampleStudent);
        res2.setExam(sampleExam);
        res2.setMarksObtained(new BigDecimal("82.00"));
        res2.setGradeLabel("B");
        res2.setGradePoint(new BigDecimal("3.00"));

        when(studentResultRepository.findByStudentIdAndTenantId(500L, TENANT_ID)).thenReturn(List.of(res1, res2));

        StudentTranscriptDTO transcript = examService.getStudentTranscript("STU-2026-001");

        assertThat(transcript).isNotNull();
        assertThat(transcript.getStudentName()).isEqualTo("Claude Shannon");
        assertThat(transcript.getTotalExams()).isEqualTo(2);
        // Average of 4.00 and 3.00 = 3.50
        assertThat(transcript.getCumulativeGpa()).isEqualByComparingTo("3.50");
    }
}
