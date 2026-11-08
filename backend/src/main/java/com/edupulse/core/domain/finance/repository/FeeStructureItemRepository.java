package com.edupulse.core.domain.finance.repository;

import com.edupulse.core.domain.finance.FeeStructureItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for FeeStructureItem entities.
 */
@Repository("coreFeeStructureItemRepository")
public interface FeeStructureItemRepository extends JpaRepository<FeeStructureItem, Long> {

    List<FeeStructureItem> findByFeeStructureIdAndTenantId(Long feeStructureId, String tenantId);

    List<FeeStructureItem> findByFeeHeadIdAndTenantId(Long feeHeadId, String tenantId);
}
