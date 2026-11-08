package com.edupulse.core.domain.academic.service;

import com.edupulse.core.domain.academic.Course;
import com.edupulse.core.domain.academic.CourseOffering;
import com.edupulse.core.domain.academic.Exam;
import com.edupulse.core.domain.academic.Faculty;
import com.edupulse.core.domain.academic.GradeScale;
import com.edupulse.core.domain.academic.StudentResult;
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
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Enterprise service implementation for Examination Scheduling, Grade Scale Mapping,
 * Student Evaluation Processing, and Academic Transcript Generation.
 */
@Service("coreExamService")
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final GradeScaleRepository gradeScaleRepository;
    private final StudentResultRepository studentResultRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final StudentRepository studentRepository;

    public ExamServiceImpl(
            @Qualifier("coreExamRepository") ExamRepository examRepository,
            @Qualifier("coreGradeScaleRepository") GradeScaleRepository gradeScaleRepository,
            @Qualifier("coreStudentResultRepository") StudentResultRepository studentResultRepository,
            @Qualifier("coreCourseOfferingRepository") CourseOfferingRepository courseOfferingRepository,
            @Qualifier("coreStudentRepository") StudentRepository studentRepository) {
        this.examRepository = examRepository;
        this.gradeScaleRepository = gradeScaleRepository;
        this.studentResultRepository = studentResultRepository;
        this.courseOfferingRepository = courseOfferingRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public ExamResponseDTO createExam(ExamRequestDTO dto) {
        String tenantId = TenantContext.getTenantId();
        CourseOffering offering = courseOfferingRepository.findByIdAndTenantId(dto.getCourseOfferingId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Course offering not found with ID: " + dto.getCourseOfferingId()));

        Exam exam = new Exam();
        exam.setName(dto.getName());
        exam.setExamDate(dto.getExamDate());
        exam.setTotalMarks(dto.getTotalMarks());
        exam.setCourseOffering(offering);

        Exam saved = examRepository.save(exam);
        return mapToExamResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponseDTO> getExams() {
        String tenantId = TenantContext.getTenantId();
        return examRepository.findByTenantId(tenantId).stream()
                .map(this::mapToExamResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResponseDTO getExamById(Long examId) {
        String tenantId = TenantContext.getTenantId();
        Exam exam = examRepository.findByIdAndTenantId(examId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with ID: " + examId));
        return mapToExamResponse(exam);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponseDTO> getExamsByCourseOffering(Long offeringId) {
        String tenantId = TenantContext.getTenantId();
        return examRepository.findByCourseOfferingIdAndTenantId(offeringId, tenantId).stream()
                .map(this::mapToExamResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GradeScaleResponseDTO defineGradeScale(GradeScaleDTO dto) {
        String tenantId = TenantContext.getTenantId();
        Optional<GradeScale> existingOpt = gradeScaleRepository.findByGradeAndTenantId(dto.getGrade(), tenantId);

        GradeScale scale = existingOpt.orElseGet(GradeScale::new);
        scale.setGrade(dto.getGrade().toUpperCase().trim());
        scale.setMinMarks(dto.getMinMarks());
        scale.setMaxMarks(dto.getMaxMarks());
        scale.setGradePoint(dto.getGradePoint());

        GradeScale saved = gradeScaleRepository.save(scale);
        return mapToGradeScaleResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GradeScaleResponseDTO> getGradeScales() {
        String tenantId = TenantContext.getTenantId();
        return gradeScaleRepository.findByTenantIdOrderByMinMarksDesc(tenantId).stream()
                .map(this::mapToGradeScaleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<ResultResponseDTO> recordStudentResults(Long examId, List<ResultRequestDTO> results) {
        String tenantId = TenantContext.getTenantId();
        Exam exam = examRepository.findByIdAndTenantId(examId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with ID: " + examId));

        List<GradeScale> scales = gradeScaleRepository.findByTenantIdOrderByMinMarksDesc(tenantId);
        List<ResultResponseDTO> responseList = new ArrayList<>();

        for (ResultRequestDTO req : results) {
            Student student = studentRepository.findByIdAndTenantId(req.getStudentId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + req.getStudentId()));

            BigDecimal marks = req.getMarksObtained();
            BigDecimal totalMarks = exam.getTotalMarks();

            BigDecimal percentage = (totalMarks != null && totalMarks.compareTo(BigDecimal.ZERO) > 0)
                    ? marks.multiply(BigDecimal.valueOf(100)).divide(totalMarks, 2, RoundingMode.HALF_UP)
                    : marks;

            String matchedGrade = "F";
            BigDecimal matchedPoint = BigDecimal.ZERO;

            if (!scales.isEmpty()) {
                boolean matched = false;
                for (GradeScale scale : scales) {
                    if (marks.compareTo(scale.getMinMarks()) >= 0 && marks.compareTo(scale.getMaxMarks()) <= 0) {
                        matchedGrade = scale.getGrade();
                        matchedPoint = scale.getGradePoint();
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    for (GradeScale scale : scales) {
                        if (percentage.compareTo(scale.getMinMarks()) >= 0 && percentage.compareTo(scale.getMaxMarks()) <= 0) {
                            matchedGrade = scale.getGrade();
                            matchedPoint = scale.getGradePoint();
                            matched = true;
                            break;
                        }
                    }
                }
            }

            StudentResult result = studentResultRepository
                    .findByExamIdAndStudentIdAndTenantId(examId, student.getId(), tenantId)
                    .orElseGet(() -> {
                        StudentResult newRes = new StudentResult();
                        newRes.setExam(exam);
                        newRes.setStudent(student);
                        return newRes;
                    });

            result.setMarksObtained(marks);
            result.setGradeLabel(matchedGrade);
            result.setGradePoint(matchedPoint);
            result.setRemarks(req.getRemarks());

            StudentResult saved = studentResultRepository.save(result);
            responseList.add(mapToResultResponse(saved));
        }

        return responseList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResultResponseDTO> getResultsByExam(Long examId) {
        String tenantId = TenantContext.getTenantId();
        return studentResultRepository.findByExamIdAndTenantId(examId, tenantId).stream()
                .map(this::mapToResultResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.edupulse.core.domain.student.dto.StudentResponseDTO> getStudentsForExam(Long examId) {
        String tenantId = TenantContext.getTenantId();
        Exam exam = examRepository.findByIdAndTenantId(examId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with ID: " + examId));

        if (exam.getCourseOffering() == null || exam.getCourseOffering().getBatch() == null) {
            return List.of();
        }

        Long batchId = exam.getCourseOffering().getBatch().getId();
        return studentRepository.findByBatchIdAndTenantId(batchId, tenantId).stream()
                .map(s -> com.edupulse.core.domain.student.dto.StudentResponseDTO.builder()
                        .id(s.getId())
                        .enrollmentNumber(s.getEnrollmentNumber())
                        .firstName(s.getFirstName())
                        .lastName(s.getLastName())
                        .email(s.getEmail())
                        .batchId(s.getBatch() != null ? s.getBatch().getId() : null)
                        .status(s.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResultResponseDTO> getResultsByStudent(Long studentId) {
        String tenantId = TenantContext.getTenantId();
        return studentResultRepository.findByStudentIdAndTenantId(studentId, tenantId).stream()
                .map(this::mapToResultResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentTranscriptDTO getStudentTranscript(String enrollmentNumber) {
        String tenantId = TenantContext.getTenantId();
        Student student = studentRepository.findByEnrollmentNumberAndTenantId(enrollmentNumber, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with enrollment number: " + enrollmentNumber));

        List<StudentResult> results = studentResultRepository.findByStudentIdAndTenantId(student.getId(), tenantId);
        List<ResultResponseDTO> mappedResults = results.stream()
                .map(this::mapToResultResponse)
                .collect(Collectors.toList());

        BigDecimal cumulativeGpa = BigDecimal.ZERO;
        if (!results.isEmpty()) {
            BigDecimal sumPoints = results.stream()
                    .map(r -> r.getGradePoint() != null ? r.getGradePoint() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            cumulativeGpa = sumPoints.divide(BigDecimal.valueOf(results.size()), 2, RoundingMode.HALF_UP);
        }

        return StudentTranscriptDTO.builder()
                .studentId(student.getId())
                .enrollmentNumber(student.getEnrollmentNumber())
                .studentName(student.getFirstName() + " " + student.getLastName())
                .email(student.getEmail())
                .batchId(student.getBatch() != null ? student.getBatch().getId() : null)
                .batchName(student.getBatch() != null ? student.getBatch().getName() : "N/A")
                .cumulativeGpa(cumulativeGpa)
                .totalExams(results.size())
                .results(mappedResults)
                .build();
    }

    private ExamResponseDTO mapToExamResponse(Exam exam) {
        CourseOffering offering = exam.getCourseOffering();
        Course course = offering != null ? offering.getCourse() : null;
        Faculty faculty = offering != null ? offering.getFaculty() : null;

        String facultyName = faculty != null ? faculty.getFirstName() + " " + faculty.getLastName() : "Unassigned";

        return ExamResponseDTO.builder()
                .id(exam.getId())
                .name(exam.getName())
                .examDate(exam.getExamDate())
                .totalMarks(exam.getTotalMarks())
                .courseOfferingId(offering != null ? offering.getId() : null)
                .courseCode(course != null ? course.getCode() : null)
                .courseName(course != null ? course.getName() : null)
                .facultyName(facultyName)
                .batchId(offering != null && offering.getBatch() != null ? offering.getBatch().getId() : null)
                .batchName(offering != null && offering.getBatch() != null ? offering.getBatch().getName() : null)
                .semester(offering != null ? offering.getSemester() : null)
                .build();
    }

    private GradeScaleResponseDTO mapToGradeScaleResponse(GradeScale scale) {
        return GradeScaleResponseDTO.builder()
                .id(scale.getId())
                .grade(scale.getGrade())
                .minMarks(scale.getMinMarks())
                .maxMarks(scale.getMaxMarks())
                .gradePoint(scale.getGradePoint())
                .build();
    }

    private ResultResponseDTO mapToResultResponse(StudentResult res) {
        Student s = res.getStudent();
        Exam e = res.getExam();
        Course c = (e != null && e.getCourseOffering() != null) ? e.getCourseOffering().getCourse() : null;

        String studentName = s != null ? s.getFirstName() + " " + s.getLastName() : "Unknown";

        return ResultResponseDTO.builder()
                .id(res.getId())
                .examId(e != null ? e.getId() : null)
                .examName(e != null ? e.getName() : null)
                .studentId(s != null ? s.getId() : null)
                .studentName(studentName)
                .enrollmentNumber(s != null ? s.getEnrollmentNumber() : null)
                .marksObtained(res.getMarksObtained())
                .totalMarks(e != null ? e.getTotalMarks() : null)
                .gradeLabel(res.getGradeLabel())
                .gradePoint(res.getGradePoint())
                .remarks(res.getRemarks())
                .courseCode(c != null ? c.getCode() : null)
                .courseName(c != null ? c.getName() : null)
                .build();
    }
}
