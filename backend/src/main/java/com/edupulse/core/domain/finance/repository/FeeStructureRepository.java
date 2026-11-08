package com.edupulse.core.domain.finance.repository;

import com.edupulse.core.domain.finance.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for FeeStructure entities.
 */
@Repository("coreFeeStructureRepository")
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {

    List<FeeStructure> findByBatchIdAndTenantId(Long batchId, String tenantId);

    List<FeeStructure> findByTenantId(String tenantId);

    Optional<FeeStructure> findByIdAndTenantId(Long id, String tenantId);
}
