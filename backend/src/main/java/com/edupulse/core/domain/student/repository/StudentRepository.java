package com.edupulse.core.domain.student.repository;

import com.edupulse.core.domain.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Data access repository for Student entities, scoped by tenant boundary.
 */
@Repository("coreStudentRepository")
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEnrollmentNumberAndTenantId(String enrollmentNumber, String tenantId);

    Optional<Student> findByIdAndTenantId(Long id, String tenantId);

    boolean existsByEnrollmentNumberAndTenantId(String enrollmentNumber, String tenantId);

    List<Student> findAllByTenantId(String tenantId);
}

