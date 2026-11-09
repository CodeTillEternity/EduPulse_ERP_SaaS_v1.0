package com.edupulse.core.domain.transport.repository;

import com.edupulse.core.domain.transport.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for institutional transport vehicles.
 */
@Repository("coreVehicleRepository")
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByTenantId(String tenantId);

    Optional<Vehicle> findByIdAndTenantId(Long id, String tenantId);

    Optional<Vehicle> findByRegistrationNumberAndTenantId(String registrationNumber, String tenantId);

    boolean existsByRegistrationNumberAndTenantId(String registrationNumber, String tenantId);
}
