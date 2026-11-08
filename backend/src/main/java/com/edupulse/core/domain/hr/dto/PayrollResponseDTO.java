package com.edupulse.core.domain.hr.dto;

import com.edupulse.core.domain.hr.PayrollStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponseDTO {

    private Long id;
    private Long facultyId;
    private String facultyName;
    private String employeeId;
    private String departmentName;
    private Integer month;
    private Integer year;
    private BigDecimal baseSalary;
    private BigDecimal deductions;
    private BigDecimal netSalary;
    private LocalDate paymentDate;
    private PayrollStatus status;
}

