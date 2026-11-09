package com.edupulse.core.domain.academic.service;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.academic.Course;
import com.edupulse.core.domain.academic.CourseOffering;
import com.edupulse.core.domain.academic.Department;
import com.edupulse.core.domain.academic.Exam;
import com.edupulse.core.domain.academic.ExamQuestion;
import com.edupulse.core.domain.academic.ExamStatus;
import com.edupulse.core.domain.academic.Faculty;
import com.edupulse.core.domain.academic.dto.CourseOfferingRequestDTO;
import com.edupulse.core.domain.academic.dto.CourseOfferingResponseDTO;
import com.edupulse.core.domain.academic.dto.CourseRequestDTO;
import com.edupulse.core.domain.academic.dto.CourseResponseDTO;
import com.edupulse.core.domain.academic.dto.ExamDefinitionDTO;
import com.edupulse.core.domain.academic.dto.ExamQuestionDTO;
import com.edupulse.core.domain.academic.dto.ExamResponseDTO;
import com.edupulse.core.domain.academic.dto.FacultyRequestDTO;
import com.edupulse.core.domain.academic.dto.FacultyResponseDTO;
import com.edupulse.core.domain.academic.repository.BatchRepository;
import com.edupulse.core.domain.academic.repository.CourseOfferingRepository;
import com.edupulse.core.domain.academic.repository.CourseRepository;
import com.edupulse.core.domain.academic.repository.DepartmentRepository;
import com.edupulse.core.domain.academic.repository.ExamQuestionRepository;
import com.edupulse.core.domain.academic.repository.ExamRepository;
import com.edupulse.core.domain.academic.repository.FacultyRepository;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.erp.common.exception.EduPulseBusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service("coreAcademicService")
@Transactional
public class AcademicServiceImpl implements AcademicService {

    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final DepartmentRepository departmentRepository;
    private final BatchRepository batchRepository;
    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final StudentRepository studentRepository;

    public AcademicServiceImpl(
            @Qualifier("coreFacultyRepository") FacultyRepository facultyRepository,
            @Qualifier("coreCourseRepository") CourseRepository courseRepository,
            @Qualifier("coreCourseOfferingRepository") CourseOfferingRepository courseOfferingRepository,
            @Qualifier("coreDepartmentRepository") DepartmentRepository departmentRepository,
            @Qualifier("coreBatchRepository") BatchRepository batchRepository,
            @Qualifier("coreExamRepository") ExamRepository examRepository,
            @Qualifier("coreExamQuestionRepository") ExamQuestionRepository examQuestionRepository,
            @Qualifier("coreStudentRepository") StudentRepository studentRepository) {
        this.facultyRepository = facultyRepository;
        this.courseRepository = courseRepository;
        this.courseOfferingRepository = courseOfferingRepository;
        this.departmentRepository = departmentRepository;
        this.batchRepository = batchRepository;
        this.examRepository = examRepository;
        this.examQuestionRepository = examQuestionRepository;
        this.studentRepository = studentRepository;
    }

    private String resolveTenantId() {
        String tenantId = TenantContext.getTenantId();
        return (tenantId != null && !tenantId.isBlank()) ? tenantId : "default";
    }

    @Override
    public FacultyResponseDTO createFaculty(FacultyRequestDTO request) {
        String tenantId = resolveTenantId();
        log.info("Creating faculty with employeeId: {} under tenant: {}", request.getEmployeeId(), tenantId);

        if (facultyRepository.existsByEmployeeIdAndTenantId(request.getEmployeeId(), tenantId)) {
            throw new IllegalArgumentException("Faculty member with employee ID '" + request.getEmployeeId() + "' already exists in this institution");
        }

        Department department = departmentRepository.findByIdAndTenantId(request.getDepartmentId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department with ID " + request.getDepartmentId() + " not found under active tenant"));

        Faculty faculty = new Faculty();
        faculty.setEmployeeId(request.getEmployeeId());
        faculty.setFirstName(request.getFirstName());
        faculty.setLastName(request.getLastName());
        faculty.setEmail(request.getEmail());
        faculty.setDesignation(request.getDesignation());
        faculty.setDepartment(department);
        faculty.setTenantId(tenantId);

        Faculty savedFaculty = facultyRepository.save(faculty);
        return mapToFacultyResponse(savedFaculty);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyResponseDTO> getAllFaculty() {
        String tenantId = resolveTenantId();
        return facultyRepository.findAllByTenantId(tenantId)
                .stream()
                .map(this::mapToFacultyResponse)
                .toList();
    }

    @Override
    public CourseResponseDTO createCourse(CourseRequestDTO request) {
        String tenantId = resolveTenantId();
        log.info("Creating course with code: {} under tenant: {}", request.getCode(), tenantId);

        if (courseRepository.existsByCodeAndTenantId(request.getCode(), tenantId)) {
            throw new IllegalArgumentException("Course with code '" + request.getCode() + "' already exists in this institution");
        }

        Department department = departmentRepository.findByIdAndTenantId(request.getDepartmentId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department with ID " + request.getDepartmentId() + " not found under active tenant"));

        Course course = new Course();
        course.setCode(request.getCode());
        course.setName(request.getName());
        course.setCredits(request.getCredits());
        course.setDepartment(department);
        course.setTenantId(tenantId);

        Course savedCourse = courseRepository.save(course);
        return mapToCourseResponse(savedCourse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getAllCourses() {
        String tenantId = resolveTenantId();
        return courseRepository.findAllByTenantId(tenantId)
                .stream()
                .map(this::mapToCourseResponse)
                .toList();
    }

    @Override
    public CourseOfferingResponseDTO assignFacultyToCourse(CourseOfferingRequestDTO request) {
        String tenantId = resolveTenantId();
        log.info("Assigning faculty: {} to course: {} for batch: {} under tenant: {}",
                request.getFacultyId(), request.getCourseId(), request.getBatchId(), tenantId);

        Course course = courseRepository.findByIdAndTenantId(request.getCourseId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Course with ID " + request.getCourseId() + " not found under active tenant"));

        Faculty faculty = facultyRepository.findByIdAndTenantId(request.getFacultyId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Faculty member with ID " + request.getFacultyId() + " not found under active tenant"));

        Batch batch = batchRepository.findByIdAndTenantId(request.getBatchId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Batch with ID " + request.getBatchId() + " not found under active tenant"));

        CourseOffering offering = new CourseOffering();
        offering.setCourse(course);
        offering.setFaculty(faculty);
        offering.setBatch(batch);
        offering.setSemester(request.getSemester());
        offering.setTenantId(tenantId);

        CourseOffering savedOffering = courseOfferingRepository.save(offering);
        return mapToOfferingResponse(savedOffering);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseOfferingResponseDTO> getAllCourseOfferings() {
        String tenantId = resolveTenantId();
        return courseOfferingRepository.findAllByTenantId(tenantId)
                .stream()
                .map(this::mapToOfferingResponse)
                .toList();
    }

    @Override
    @PreAuthorize("hasAnyRole('ACADEMIC_ADMIN', 'FACULTY', 'SUPER_ADMIN', 'SUPERADMIN', 'ADMIN')")
    public ExamResponseDTO createExam(ExamDefinitionDTO request) {
        String tenantId = resolveTenantId();
        assertNotStudentCaller("create exams");

        CourseOffering offering = null;
        if (request.getCourseOfferingId() != null) {
            offering = courseOfferingRepository.findByIdAndTenantId(request.getCourseOfferingId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Course offering not found with ID: " + request.getCourseOfferingId()));
        }

        Long resolvedCourseId = request.getCourseId();
        if (resolvedCourseId == null && offering != null && offering.getCourse() != null) {
            resolvedCourseId = offering.getCourse().getId();
        }

        LocalDate examDate = request.getScheduledStartTime() != null
                ? request.getScheduledStartTime().toLocalDate()
                : LocalDate.now();

        Exam exam = new Exam();
        exam.setTitle(request.getTitle());
        exam.setName(request.getTitle());
        exam.setScheduledStartTime(request.getScheduledStartTime());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setMaxMarks(request.getMaxMarks());
        exam.setPassingMarks(request.getPassingMarks());
        exam.setTotalMarks(request.getMaxMarks());
        exam.setExamDate(examDate);
        exam.setCourseOffering(offering);
        exam.setCourseId(resolvedCourseId);
        exam.setExamPin(request.getExamPin());
        exam.setAllowedIpSubnet(request.getAllowedIpSubnet());
        exam.setSebConfigKey(request.getSebConfigKey() != null && !request.getSebConfigKey().isBlank()
                ? request.getSebConfigKey()
                : java.util.UUID.randomUUID().toString().replace("-", ""));
        exam.setStatus(request.getStatus() != null ? request.getStatus() : ExamStatus.DRAFT);
        exam.setTenantId(tenantId);

        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            for (ExamQuestionDTO qDto : request.getQuestions()) {
                ExamQuestion question = ExamQuestion.builder()
                        .questionText(qDto.getQuestionText())
                        .questionType(qDto.getQuestionType() != null ? qDto.getQuestionType() : "MULTIPLE_CHOICE")
                        .optionsJson(qDto.getOptionsJson())
                        .correctAnswer(qDto.getCorrectAnswer())
                        .marks(qDto.getMarks())
                        .orderIndex(qDto.getOrderIndex() != null ? qDto.getOrderIndex() : 0)
                        .build();
                exam.addQuestion(question);
            }
        }

        Exam savedExam = examRepository.save(exam);
        log.info("Exam [{}] created with status [{}] by authorized academic staff for tenant [{}]",
                savedExam.getId(), savedExam.getStatus(), tenantId);
        return mapToExamResponse(savedExam);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponseDTO> getPublishedExamsForStudent(Long studentId, Long courseId) {
        String tenantId = resolveTenantId();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        boolean isStudent = isStudentUser(auth);
        if (isStudent) {
            Student student = resolveStudent(studentId, auth, tenantId);
            List<Long> enrolledCourseIds = getEnrolledCourseIds(student, tenantId);

            if (courseId != null) {
                if (!enrolledCourseIds.contains(courseId)) {
                    throw new EduPulseBusinessException(
                            "Access denied: Student is not enrolled in course ID " + courseId,
                            HttpStatus.FORBIDDEN);
                }
                return examRepository.findPublishedExamsForCourse(courseId, ExamStatus.PUBLISHED, tenantId)
                        .stream()
                        .map(this::mapToExamResponse)
                        .toList();
            } else {
                if (enrolledCourseIds.isEmpty()) {
                    return Collections.emptyList();
                }
                return examRepository.findPublishedExamsForCourses(enrolledCourseIds, ExamStatus.PUBLISHED, tenantId)
                        .stream()
                        .map(this::mapToExamResponse)
                        .toList();
            }
        }

        // Faculty or Academic Admin querying student's course exams
        if (courseId != null) {
            return examRepository.findPublishedExamsForCourse(courseId, ExamStatus.PUBLISHED, tenantId)
                    .stream()
                    .map(this::mapToExamResponse)
                    .toList();
        }
        return examRepository.findByStatusAndTenantId(ExamStatus.PUBLISHED, tenantId)
                .stream()
                .map(this::mapToExamResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponseDTO> getExamsForCourse(Long courseId) {
        String tenantId = resolveTenantId();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (isStudentUser(auth)) {
            return getPublishedExamsForStudent(null, courseId);
        }

        return examRepository.findByCourseOfferingIdAndTenantId(courseId, tenantId)
                .stream()
                .map(this::mapToExamResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResponseDTO getExamById(Long examId) {
        String tenantId = resolveTenantId();
        Exam exam = examRepository.findByIdAndTenantId(examId, tenantId)
                .orElseThrow(() -> new EduPulseBusinessException("Exam not found with ID: " + examId, HttpStatus.NOT_FOUND));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (isStudentUser(auth)) {
            if (exam.getStatus() != ExamStatus.PUBLISHED) {
                throw new EduPulseBusinessException("Access denied: Exam is not published", HttpStatus.FORBIDDEN);
            }
            Student student = resolveStudent(null, auth, tenantId);
            List<Long> enrolledCourseIds = getEnrolledCourseIds(student, tenantId);
            Long examCourseId = exam.getCourseId();
            if (examCourseId != null && !enrolledCourseIds.contains(examCourseId)) {
                throw new EduPulseBusinessException(
                        "Access denied: Student is not enrolled in the course for this exam",
                        HttpStatus.FORBIDDEN);
            }
        }

        return mapToExamResponse(exam);
    }

    @Override
    @PreAuthorize("hasAnyRole('ACADEMIC_ADMIN', 'FACULTY', 'SUPER_ADMIN', 'SUPERADMIN', 'ADMIN')")
    public ExamResponseDTO publishExam(Long examId) {
        String tenantId = resolveTenantId();
        assertNotStudentCaller("publish exams");

        Exam exam = examRepository.findByIdAndTenantId(examId, tenantId)
                .orElseThrow(() -> new EduPulseBusinessException("Exam not found with ID: " + examId, HttpStatus.NOT_FOUND));

        exam.setStatus(ExamStatus.PUBLISHED);
        Exam updated = examRepository.save(exam);
        log.info("Exam [{}] published successfully under tenant [{}]", examId, tenantId);
        return mapToExamResponse(updated);
    }

    private boolean isStudentUser(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
    }

    private void assertNotStudentCaller(String action) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (isStudentUser(auth)) {
            throw new EduPulseBusinessException(
                    "Access denied: Students are not authorized to " + action,
                    HttpStatus.FORBIDDEN);
        }
    }

    private Student resolveStudent(Long studentId, Authentication auth, String tenantId) {
        if (studentId != null) {
            return studentRepository.findByIdAndTenantId(studentId, tenantId)
                    .orElseThrow(() -> new EduPulseBusinessException("Student not found with ID: " + studentId, HttpStatus.NOT_FOUND));
        }
        if (auth != null && auth.getName() != null) {
            return studentRepository.findByEmailAndTenantId(auth.getName(), tenantId)
                    .or(() -> studentRepository.findByEnrollmentNumberAndTenantId(auth.getName(), tenantId))
                    .orElseThrow(() -> new EduPulseBusinessException("Student profile not found for authenticated principal", HttpStatus.NOT_FOUND));
        }
        throw new EduPulseBusinessException("Unable to resolve student identity from security context", HttpStatus.UNAUTHORIZED);
    }

    private List<Long> getEnrolledCourseIds(Student student, String tenantId) {
        if (student.getBatch() == null) {
            return Collections.emptyList();
        }
        Long batchId = student.getBatch().getId();
        List<CourseOffering> offerings = courseOfferingRepository.findByBatchIdAndTenantId(batchId, tenantId);
        return offerings.stream()
                .map(o -> o.getCourse() != null ? o.getCourse().getId() : null)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private FacultyResponseDTO mapToFacultyResponse(Faculty faculty) {
        return FacultyResponseDTO.builder()
                .id(faculty.getId())
                .employeeId(faculty.getEmployeeId())
                .firstName(faculty.getFirstName())
                .lastName(faculty.getLastName())
                .email(faculty.getEmail())
                .designation(faculty.getDesignation())
                .departmentId(faculty.getDepartment() != null ? faculty.getDepartment().getId() : null)
                .departmentName(faculty.getDepartment() != null ? faculty.getDepartment().getName() : null)
                .tenantId(faculty.getTenantId())
                .createdAt(faculty.getCreatedAt())
                .build();
    }

    private CourseResponseDTO mapToCourseResponse(Course course) {
        return CourseResponseDTO.builder()
                .id(course.getId())
                .code(course.getCode())
                .name(course.getName())
                .credits(course.getCredits())
                .departmentId(course.getDepartment() != null ? course.getDepartment().getId() : null)
                .departmentName(course.getDepartment() != null ? course.getDepartment().getName() : null)
                .tenantId(course.getTenantId())
                .createdAt(course.getCreatedAt())
                .build();
    }

    private CourseOfferingResponseDTO mapToOfferingResponse(CourseOffering offering) {
        String facultyFullName = offering.getFaculty() != null
                ? offering.getFaculty().getFirstName() + " " + offering.getFaculty().getLastName()
                : null;

        return CourseOfferingResponseDTO.builder()
                .id(offering.getId())
                .courseId(offering.getCourse() != null ? offering.getCourse().getId() : null)
                .courseName(offering.getCourse() != null ? offering.getCourse().getName() : null)
                .courseCode(offering.getCourse() != null ? offering.getCourse().getCode() : null)
                .facultyId(offering.getFaculty() != null ? offering.getFaculty().getId() : null)
                .facultyName(facultyFullName)
                .facultyEmployeeId(offering.getFaculty() != null ? offering.getFaculty().getEmployeeId() : null)
                .batchId(offering.getBatch() != null ? offering.getBatch().getId() : null)
                .batchAcademicYear(offering.getBatch() != null ? offering.getBatch().getAcademicYear() : null)
                .semester(offering.getSemester())
                .tenantId(offering.getTenantId())
                .createdAt(offering.getCreatedAt())
                .build();
    }

    private ExamResponseDTO mapToExamResponse(Exam exam) {
        List<ExamQuestionDTO> questionDTOs = exam.getQuestions() != null
                ? exam.getQuestions().stream().map(q -> ExamQuestionDTO.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .questionType(q.getQuestionType())
                        .optionsJson(q.getOptionsJson())
                        .correctAnswer(q.getCorrectAnswer())
                        .marks(q.getMarks())
                        .orderIndex(q.getOrderIndex())
                        .build()).toList()
                : Collections.emptyList();

        CourseOffering offering = exam.getCourseOffering();
        Long courseOfferingId = offering != null ? offering.getId() : null;
        Long courseId = exam.getCourseId();
        String courseCode = offering != null && offering.getCourse() != null ? offering.getCourse().getCode() : null;
        String courseName = offering != null && offering.getCourse() != null ? offering.getCourse().getName() : null;
        String facultyName = offering != null && offering.getFaculty() != null
                ? offering.getFaculty().getFirstName() + " " + offering.getFaculty().getLastName() : null;
        Long batchId = offering != null && offering.getBatch() != null ? offering.getBatch().getId() : null;
        String batchName = offering != null && offering.getBatch() != null ? offering.getBatch().getName() : null;
        String semester = offering != null ? offering.getSemester() : null;

        LocalDate examDate = exam.getExamDate() != null
                ? exam.getExamDate()
                : (exam.getScheduledStartTime() != null ? exam.getScheduledStartTime().toLocalDate() : null);

        return ExamResponseDTO.builder()
                .id(exam.getId())
                .name(exam.getName())
                .title(exam.getTitle())
                .examDate(examDate)
                .scheduledStartTime(exam.getScheduledStartTime())
                .durationMinutes(exam.getDurationMinutes())
                .totalMarks(exam.getTotalMarks())
                .maxMarks(exam.getMaxMarks())
                .passingMarks(exam.getPassingMarks())
                .status(exam.getStatus())
                .courseOfferingId(courseOfferingId)
                .courseId(courseId)
                .courseCode(courseCode)
                .courseName(courseName)
                .facultyName(facultyName)
                .batchId(batchId)
                .batchName(batchName)
                .semester(semester)
                .examPin(exam.getExamPin())
                .allowedIpSubnet(exam.getAllowedIpSubnet())
                .sebConfigKey(exam.getSebConfigKey())
                .questions(questionDTOs)
                .build();
    }
}
