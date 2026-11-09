package com.edupulse.core.domain.transport;

import com.edupulse.core.domain.base.BaseTenantEntity;
import com.edupulse.core.domain.student.Student;
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

import java.time.LocalDate;

/**
 * Domain entity mapping a Student to a TransportRoute with their specific pickup stop and active status.
 * Extends BaseTenantEntity for strict multi-tenant boundary isolation.
 */
@Entity(name = "TransportCoreRouteAssignment")
@Table(name = "transport_route_assignments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class RouteAssignment extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "route_id", nullable = false)
    private TransportRoute route;

    @Column(name = "pickup_stop", length = 150)
    private String pickupStop;

    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
