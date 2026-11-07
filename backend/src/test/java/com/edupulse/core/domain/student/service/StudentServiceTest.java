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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private BatchRepository batchRepository;

    @InjectMocks
    private StudentServiceImpl studentService;

    private Department department;
    private Batch batch;

    @BeforeEach
    void setUp() {
        TenantContext.clear();
        TenantContext.setTenantId("tenant-mit");

        department = new Department("Artificial Intelligence", "AI");
        department.setId(10L);
        department.setTenantId("tenant-mit");

        batch = new Batch("2026-2027", 1, department);
        batch.setId(20L);
        batch.setTenantId("tenant-mit");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("enrollNewStudent successfully resolves relationships and persists student")
    void enrollNewStudent_success() {
        StudentRequestDTO request = StudentRequestDTO.builder()
                .enrollmentNumber("AI-2026-001")
                .firstName("Alan")
                .lastName("Turing")
                .email("alan.turing@mit.edu")
                .departmentId(10L)
                .batchId(20L)
                .status(EnrollmentStatus.ACTIVE)
                .build();

        when(studentRepository.existsByEnrollmentNumberAndTenantId("AI-2026-001", "tenant-mit")).thenReturn(false);
        when(departmentRepository.findByIdAndTenantId(10L, "tenant-mit")).thenReturn(Optional.of(department));
        when(batchRepository.findByIdAndTenantId(20L, "tenant-mit")).thenReturn(Optional.of(batch));

        Student saved = new Student();
        saved.setId(101L);
        saved.setEnrollmentNumber("AI-2026-001");
        saved.setFirstName("Alan");
        saved.setLastName("Turing");
        saved.setEmail("alan.turing@mit.edu");
        saved.setDepartment(department);
        saved.setBatch(batch);
        saved.setStatus(EnrollmentStatus.ACTIVE);
        saved.setTenantId("tenant-mit");

        when(studentRepository.save(any(Student.class))).thenReturn(saved);

        StudentResponseDTO response = studentService.enrollNewStudent(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(101L);
        assertThat(response.getEnrollmentNumber()).isEqualTo("AI-2026-001");
        assertThat(response.getTenantId()).isEqualTo("tenant-mit");
        assertThat(response.getDepartmentName()).isEqualTo("Artificial Intelligence");
        assertThat(response.getAcademicYear()).isEqualTo("2026-2027");

        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("enrollNewStudent throws IllegalArgumentException when enrollmentNumber already exists in tenant")
    void enrollNewStudent_throwsWhenDuplicateEnrollment() {
        StudentRequestDTO request = StudentRequestDTO.builder()
                .enrollmentNumber("AI-2026-001")
                .departmentId(10L)
                .batchId(20L)
                .build();

        when(studentRepository.existsByEnrollmentNumberAndTenantId("AI-2026-001", "tenant-mit")).thenReturn(true);

        assertThatThrownBy(() -> studentService.enrollNewStudent(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists for tenant");
    }

    @Test
    @DisplayName("getStudentById returns student matching active tenant")
    void getStudentById_returnsStudent() {
        Student student = new Student();
        student.setId(55L);
        student.setEnrollmentNumber("AI-055");
        student.setFirstName("Grace");
        student.setLastName("Hopper");
        student.setEmail("grace.hopper@mit.edu");
        student.setDepartment(department);
        student.setBatch(batch);
        student.setTenantId("tenant-mit");

        when(studentRepository.findByIdAndTenantId(55L, "tenant-mit")).thenReturn(Optional.of(student));

        StudentResponseDTO response = studentService.getStudentById(55L);

        assertThat(response).isNotNull();
        assertThat(response.getFirstName()).isEqualTo("Grace");
        assertThat(response.getEmail()).isEqualTo("grace.hopper@mit.edu");
    }

    @Test
    @DisplayName("getStudentByEnrollmentNumber returns student when exists")
    void getStudentByEnrollmentNumber_returnsStudent() {
        Student student = new Student();
        student.setId(77L);
        student.setEnrollmentNumber("AI-077");
        student.setFirstName("Claude");
        student.setLastName("Shannon");
        student.setEmail("claude.shannon@mit.edu");
        student.setDepartment(department);
        student.setBatch(batch);
        student.setTenantId("tenant-mit");

        when(studentRepository.findByEnrollmentNumberAndTenantId("AI-077", "tenant-mit")).thenReturn(Optional.of(student));

        StudentResponseDTO response = studentService.getStudentByEnrollmentNumber("AI-077");

        assertThat(response).isNotNull();
        assertThat(response.getLastName()).isEqualTo("Shannon");
    }
}

