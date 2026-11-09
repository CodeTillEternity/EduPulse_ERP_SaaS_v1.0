package com.edupulse.core.domain.transport.repository;

import com.edupulse.core.domain.transport.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for institutional transport routes.
 */
@Repository("coreTransportRouteRepository")
public interface TransportRouteRepository extends JpaRepository<TransportRoute, Long> {

    List<TransportRoute> findByTenantId(String tenantId);

    Optional<TransportRoute> findByIdAndTenantId(Long id, String tenantId);

    List<TransportRoute> findByVehicleIdAndTenantId(Long vehicleId, String tenantId);
}
