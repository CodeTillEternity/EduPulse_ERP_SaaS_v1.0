package com.edupulse.core.domain.academic.repository;

import com.edupulse.core.domain.academic.StudentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for StudentResult entities partitioned by tenantId.
 */
@Repository("coreStudentResultRepository")
public interface StudentResultRepository extends JpaRepository<StudentResult, Long> {

    List<StudentResult> findByExamIdAndTenantId(Long examId, String tenantId);

    List<StudentResult> findByStudentIdAndTenantId(Long studentId, String tenantId);

    Optional<StudentResult> findByExamIdAndStudentIdAndTenantId(Long examId, Long studentId, String tenantId);

    List<StudentResult> findByStudentEnrollmentNumberAndTenantId(String enrollmentNumber, String tenantId);

    List<StudentResult> findByTenantId(String tenantId);

    Optional<StudentResult> findByIdAndTenantId(Long id, String tenantId);
}
