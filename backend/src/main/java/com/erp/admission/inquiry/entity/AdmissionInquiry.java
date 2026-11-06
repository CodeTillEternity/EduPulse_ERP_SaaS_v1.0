package com.erp.admission.inquiry.entity;

import com.erp.multitenancy.BaseTenantEntity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "admission_inquiry")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdmissionInquiry extends BaseTenantEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String prospectName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    private String programOfInterest;

    @Column(nullable = false)
    private String status; // NEW, CONTACTED, CONVERTED, CLOSED

    private String notes;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
