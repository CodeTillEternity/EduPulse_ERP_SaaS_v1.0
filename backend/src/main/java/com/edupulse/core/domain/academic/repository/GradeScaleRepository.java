package com.edupulse.core.domain.academic.repository;

import com.edupulse.core.domain.academic.GradeScale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for GradeScale entities partitioned by tenantId.
 */
@Repository("coreGradeScaleRepository")
public interface GradeScaleRepository extends JpaRepository<GradeScale, Long> {

    List<GradeScale> findByTenantId(String tenantId);

    List<GradeScale> findByTenantIdOrderByMinMarksDesc(String tenantId);

    Optional<GradeScale> findByIdAndTenantId(Long id, String tenantId);

    Optional<GradeScale> findByGradeAndTenantId(String grade, String tenantId);
}
