package com.edupulse.core.domain.portal.dto;

import com.edupulse.core.domain.finance.dto.StudentInvoiceResponseDTO;
import com.edupulse.core.domain.operations.dto.TimetableResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Aggregated dashboard DTO returned to the authenticated student,
 * comprising today's schedule, pending fee assessments, and GPA metrics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortalDashboardDTO {

    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private String email;
    private Long batchId;
    private String batchName;
    private String departmentName;

    @Builder.Default
    private List<TimetableResponseDTO> todayClasses = new ArrayList<>();

    @Builder.Default
    private List<StudentInvoiceResponseDTO> unpaidInvoices = new ArrayList<>();

    private BigDecimal cumulativeGpa;
    private BigDecimal totalUnpaidAmount;
}
