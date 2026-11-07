package com.edupulse.core.domain.academic.repository;

import com.edupulse.core.domain.academic.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("coreBatchRepository")
public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByIdAndTenantId(Long id, String tenantId);

    List<Batch> findByDepartmentIdAndTenantId(Long departmentId, String tenantId);

    List<Batch> findAllByTenantId(String tenantId);
}
