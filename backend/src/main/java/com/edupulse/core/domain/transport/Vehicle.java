package com.edupulse.core.domain.transport;

import com.edupulse.core.domain.base.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Domain entity representing an institutional transport vehicle (bus, van, shuttle).
 * Extends BaseTenantEntity for automated multi-tenant isolation.
 */
@Entity(name = "TransportCoreVehicle")
@Table(
        name = "transport_vehicles",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_transport_vehicle_reg_tenant", columnNames = {"registration_number", "tenant_id"})
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Vehicle extends BaseTenantEntity {

    @Column(name = "registration_number", nullable = false, length = 50)
    private String registrationNumber;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "driver_name", nullable = false, length = 100)
    private String driverName;
}
