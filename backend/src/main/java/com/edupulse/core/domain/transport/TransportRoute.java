package com.edupulse.core.domain.transport;

import com.edupulse.core.domain.base.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * Domain entity representing an institutional transport route with pickup stops and assigned vehicle.
 * Extends BaseTenantEntity for tenant boundary scoping.
 */
@Entity(name = "TransportCoreRoute")
@Table(name = "transport_routes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class TransportRoute extends BaseTenantEntity {

    @Column(name = "route_name", nullable = false, length = 150)
    private String routeName;

    @Column(name = "stops", nullable = false, columnDefinition = "TEXT")
    private String stops;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "monthly_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyFee;
}
