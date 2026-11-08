package com.edupulse.core.domain.hr.service;

import com.edupulse.core.domain.hr.LeaveStatus;
import com.edupulse.core.domain.hr.dto.LeaveRequestDTO;
import com.edupulse.core.domain.hr.dto.LeaveResponseDTO;
import com.edupulse.core.domain.hr.dto.LeaveReviewDTO;
import com.edupulse.core.domain.hr.dto.MonthlyPayrollRequestDTO;
import com.edupulse.core.domain.hr.dto.PayrollResponseDTO;

import java.util.List;

/**
 * Service interface for staff leave administration and automated monthly payroll generation.
 */
public interface HRService {

    LeaveResponseDTO applyForLeave(LeaveRequestDTO request);

    LeaveResponseDTO reviewLeave(Long leaveId, LeaveStatus status, String reviewNotes);

    LeaveResponseDTO reviewLeave(Long leaveId, LeaveReviewDTO reviewDTO);

    List<LeaveResponseDTO> getPendingLeaves();

    List<LeaveResponseDTO> getLeavesByFaculty(Long facultyId);

    List<LeaveResponseDTO> getAllLeaves();

    List<PayrollResponseDTO> generateMonthlyPayroll(Integer month, Integer year);

    List<PayrollResponseDTO> generateMonthlyPayroll(MonthlyPayrollRequestDTO request);

    List<PayrollResponseDTO> getMonthlyPayroll(Integer month, Integer year);

    PayrollResponseDTO markPayrollAsPaid(Long payrollId);

    List<PayrollResponseDTO> getPayrollByFaculty(Long facultyId);
}

