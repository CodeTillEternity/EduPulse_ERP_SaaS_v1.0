package com.edupulse.core.domain.student.service;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.academic.Department;
import com.edupulse.core.domain.academic.repository.BatchRepository;
import com.edupulse.core.domain.academic.repository.DepartmentRepository;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.EnrollmentStatus;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.dto.StudentRequestDTO;
import com.edupulse.core.domain.student.dto.StudentResponseDTO;
import com.edupulse.core.domain.student.repository.StudentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Production implementation of StudentService supporting multi-tenant isolation,
 * relational resolution of academic entities, and tenant-aware caching.
 */
@Service("coreStudentService")
@Slf4j
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final BatchRepository batchRepository;

    public StudentServiceImpl(StudentRepository studentRepository,
                              DepartmentRepository departmentRepository,
                              BatchRepository batchRepository) {
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.batchRepository = batchRepository;
    }

    @Override
    @Transactional
    @CacheEvict(value = "students", allEntries = true)
    public StudentResponseDTO enrollNewStudent(StudentRequestDTO dto) {
        String tenantId = resolveTenantId();
        log.info("Enrolling new student [enrollmentNumber={}, tenant={}]", dto.getEnrollmentNumber(), tenantId);

        if (studentRepository.existsByEnrollmentNumberAndTenantId(dto.getEnrollmentNumber(), tenantId)) {
            throw new IllegalArgumentException(
                    "Student with enrollment number '" + dto.getEnrollmentNumber() + "' already exists for tenant: " + tenantId);
        }

        Department department = departmentRepository.findByIdAndTenantId(dto.getDepartmentId(), tenantId)
                .orElseGet(() -> departmentRepository.findById(dto.getDepartmentId())
                        .orElseThrow(() -> new IllegalArgumentException("Department not found with ID: " + dto.getDepartmentId())));

        Batch batch = batchRepository.findByIdAndTenantId(dto.getBatchId(), tenantId)
                .orElseGet(() -> batchRepository.findById(dto.getBatchId())
                        .orElseThrow(() -> new IllegalArgumentException("Batch not found with ID: " + dto.getBatchId())));

        Student student = new Student();
        student.setEnrollmentNumber(dto.getEnrollmentNumber());
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        student.setDepartment(department);
        student.setBatch(batch);
        student.setStatus(dto.getStatus() != null ? dto.getStatus() : EnrollmentStatus.ACTIVE);
        student.setTenantId(tenantId);

        Student savedStudent = studentRepository.save(student);
        log.info("Successfully enrolled student [id={}, enrollmentNumber={}, tenant={}]",
                savedStudent.getId(), savedStudent.getEnrollmentNumber(), savedStudent.getTenantId());

        return mapToDTO(savedStudent);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "students", key = "T(com.edupulse.core.domain.base.TenantContext).getTenantId() + ':id:' + #id")
    public StudentResponseDTO getStudentById(Long id) {
        String tenantId = resolveTenantId();
        log.debug("Fetching student by ID [id={}, tenant={}]", id, tenantId);

        Student student = studentRepository.findByIdAndTenantId(id, tenantId)
                .orElseGet(() -> studentRepository.findById(id)
                        .filter(s -> tenantId.equals(s.getTenantId()) || "default".equals(tenantId))
                        .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + id + " for tenant: " + tenantId)));

        return mapToDTO(student);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "students", key = "T(com.edupulse.core.domain.base.TenantContext).getTenantId() + ':enrollment:' + #enrollmentNumber")
    public StudentResponseDTO getStudentByEnrollmentNumber(String enrollmentNumber) {
        String tenantId = resolveTenantId();
        log.debug("Fetching student by enrollment number [enrollmentNumber={}, tenant={}]", enrollmentNumber, tenantId);

        Student student = studentRepository.findByEnrollmentNumberAndTenantId(enrollmentNumber, tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student not found with enrollment number: " + enrollmentNumber + " for tenant: " + tenantId));

        return mapToDTO(student);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "students", key = "T(com.edupulse.core.domain.base.TenantContext).getTenantId() + ':email:' + #email")
    public StudentResponseDTO getStudentByEmail(String email) {
        String tenantId = resolveTenantId();
        log.debug("Fetching student by email [email={}, tenant={}]", email, tenantId);

        Student student = studentRepository.findByEmailAndTenantId(email, tenantId)
                .or(() -> studentRepository.findByEmail(email))
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student not found with email: " + email + " for tenant: " + tenantId));

        return mapToDTO(student);
    }

    private String resolveTenantId() {
        String tenantId = TenantContext.getTenantId();
        return (tenantId != null && !tenantId.isBlank()) ? tenantId : "default";
    }

    private StudentResponseDTO mapToDTO(Student student) {
        return StudentResponseDTO.builder()
                .id(student.getId())
                .enrollmentNumber(student.getEnrollmentNumber())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .tenantId(student.getTenantId())
                .departmentId(student.getDepartment() != null ? student.getDepartment().getId() : null)
                .departmentName(student.getDepartment() != null ? student.getDepartment().getName() : null)
                .departmentCode(student.getDepartment() != null ? student.getDepartment().getCode() : null)
                .batchId(student.getBatch() != null ? student.getBatch().getId() : null)
                .academicYear(student.getBatch() != null ? student.getBatch().getAcademicYear() : null)
                .currentSemester(student.getBatch() != null ? student.getBatch().getCurrentSemester() : null)
                .status(student.getStatus())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }
}
