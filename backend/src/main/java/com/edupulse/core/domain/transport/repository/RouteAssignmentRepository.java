package com.edupulse.core.domain.transport.repository;

import com.edupulse.core.domain.transport.RouteAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for mapping students to transport routes.
 */
@Repository("coreRouteAssignmentRepository")
public interface RouteAssignmentRepository extends JpaRepository<RouteAssignment, Long> {

    List<RouteAssignment> findByTenantId(String tenantId);

    Optional<RouteAssignment> findByIdAndTenantId(Long id, String tenantId);

    List<RouteAssignment> findByRouteIdAndTenantId(Long routeId, String tenantId);

    List<RouteAssignment> findByRouteIdAndActiveTrueAndTenantId(Long routeId, String tenantId);

    long countByRouteIdAndActiveTrueAndTenantId(Long routeId, String tenantId);

    List<RouteAssignment> findByStudentIdAndActiveTrueAndTenantId(Long studentId, String tenantId);

    List<RouteAssignment> findByStudentIdAndTenantId(Long studentId, String tenantId);
}
