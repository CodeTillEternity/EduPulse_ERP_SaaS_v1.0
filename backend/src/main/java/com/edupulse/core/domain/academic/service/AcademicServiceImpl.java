package com.edupulse.core.domain.academic.service;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.academic.Course;
import com.edupulse.core.domain.academic.CourseOffering;
import com.edupulse.core.domain.academic.Department;
import com.edupulse.core.domain.academic.Faculty;
import com.edupulse.core.domain.academic.dto.CourseOfferingRequestDTO;
import com.edupulse.core.domain.academic.dto.CourseOfferingResponseDTO;
import com.edupulse.core.domain.academic.dto.CourseRequestDTO;
import com.edupulse.core.domain.academic.dto.CourseResponseDTO;
import com.edupulse.core.domain.academic.dto.FacultyRequestDTO;
import com.edupulse.core.domain.academic.dto.FacultyResponseDTO;
import com.edupulse.core.domain.academic.repository.BatchRepository;
import com.edupulse.core.domain.academic.repository.CourseOfferingRepository;
import com.edupulse.core.domain.academic.repository.CourseRepository;
import com.edupulse.core.domain.academic.repository.DepartmentRepository;
import com.edupulse.core.domain.academic.repository.FacultyRepository;
import com.edupulse.core.domain.base.TenantContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service("coreAcademicService")
@Transactional
public class AcademicServiceImpl implements AcademicService {

    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final DepartmentRepository departmentRepository;
    private final BatchRepository batchRepository;

    public AcademicServiceImpl(
            @Qualifier("coreFacultyRepository") FacultyRepository facultyRepository,
            @Qualifier("coreCourseRepository") CourseRepository courseRepository,
            @Qualifier("coreCourseOfferingRepository") CourseOfferingRepository courseOfferingRepository,
            @Qualifier("coreDepartmentRepository") DepartmentRepository departmentRepository,
            @Qualifier("coreBatchRepository") BatchRepository batchRepository) {
        this.facultyRepository = facultyRepository;
        this.courseRepository = courseRepository;
        this.courseOfferingRepository = courseOfferingRepository;
        this.departmentRepository = departmentRepository;
        this.batchRepository = batchRepository;
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
}

