package com.erp.subscription.repository;

import com.erp.subscription.entity.TenantSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantSubscriptionRepository extends JpaRepository<TenantSubscription, Long> {
    Optional<TenantSubscription> findFirstByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(String tenantId);
    List<TenantSubscription> findByTenantId(String tenantId);
    boolean existsByTenantIdAndIsActiveTrue(String tenantId);
}
