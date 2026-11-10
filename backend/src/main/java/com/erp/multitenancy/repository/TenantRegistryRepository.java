package com.erp.multitenancy.repository;

import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.AccountStatus;
import com.erp.multitenancy.model.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRegistryRepository extends JpaRepository<TenantRegistry, String> {
    Optional<TenantRegistry> findByTenantId(String tenantId);
    Optional<TenantRegistry> findBySubdomainIgnoreCase(String subdomain);
    boolean existsBySubdomainIgnoreCase(String subdomain);

    Optional<TenantRegistry> findByInstitutionNameIgnoreCase(String institutionName);
    Optional<TenantRegistry> findByAdminEmailIgnoreCase(String adminEmail);
    boolean existsByInstitutionNameIgnoreCase(String institutionName);
    boolean existsByAdminEmailIgnoreCase(String adminEmail);

    List<TenantRegistry> findByAccountStatus(AccountStatus accountStatus);
    List<TenantRegistry> findByStatusAndTrialEndDateBefore(TenantStatus status, LocalDateTime dateTime);

    List<TenantRegistry> findByDatabaseMode(String databaseMode);
    List<TenantRegistry> findByDatabaseModeIgnoreCase(String databaseMode);
}
