package com.edupulse.core.domain.finance.repository;

import com.edupulse.core.domain.finance.FeeHead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for FeeHead entities, respecting tenant boundaries.
 */
@Repository("coreFeeHeadRepository")
public interface FeeHeadRepository extends JpaRepository<FeeHead, Long> {

    List<FeeHead> findByTenantId(String tenantId);

    List<FeeHead> findByActiveTrueAndTenantId(String tenantId);

    Optional<FeeHead> findByNameAndTenantId(String name, String tenantId);

    Optional<FeeHead> findByIdAndTenantId(Long id, String tenantId);
}
