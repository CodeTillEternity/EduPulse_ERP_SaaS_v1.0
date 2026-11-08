package com.edupulse.core.domain.student.repository;

import com.edupulse.core.domain.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    List<Student> findByBatchIdAndTenantId(Long batchId, String tenantId);

    List<Student> findByBatchId(Long batchId);

    boolean existsByEnrollmentNumberAndTenantId(String enrollmentNumber, String tenantId);

    List<Student> findAllByTenantId(String tenantId);

    @Query(value = "SELECT * FROM core_students s WHERE s.enrollment_number = :enrollmentNumber AND s.tenant_id = :tenantId", nativeQuery = true)
    Optional<Student> findByEnrollmentNumberNative(@Param("enrollmentNumber") String enrollmentNumber, @Param("tenantId") String tenantId);

    @Query(value = "SELECT COUNT(*) FROM core_students s WHERE s.tenant_id = :tenantId", nativeQuery = true)
    long countByTenantIdNative(@Param("tenantId") String tenantId);
}

