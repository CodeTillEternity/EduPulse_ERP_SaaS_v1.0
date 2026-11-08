package com.edupulse.core.domain.academic.repository;

import com.edupulse.core.domain.academic.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Exam entities partitioned by tenantId.
 */
@Repository("coreExamRepository")
public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByCourseOfferingIdAndTenantId(Long courseOfferingId, String tenantId);

    List<Exam> findByTenantId(String tenantId);

    Optional<Exam> findByIdAndTenantId(Long id, String tenantId);
}
