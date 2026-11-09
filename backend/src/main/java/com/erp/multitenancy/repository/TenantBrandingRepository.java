package com.erp.multitenancy.repository;

import com.erp.multitenancy.entity.TenantBranding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA Repository for TenantBranding entities.
 */
@Repository
public interface TenantBrandingRepository extends JpaRepository<TenantBranding, Long> {

    Optional<TenantBranding> findByCustomSubdomainIgnoreCase(String customSubdomain);

    Optional<TenantBranding> findByTenant_TenantId(String tenantId);

    Optional<TenantBranding> findByTenant_TenantIdIgnoreCase(String tenantId);
}
