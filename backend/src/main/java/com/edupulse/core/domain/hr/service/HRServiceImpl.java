package com.edupulse.core.domain.hr.service;

import com.edupulse.core.domain.academic.Faculty;
import com.edupulse.core.domain.academic.repository.FacultyRepository;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.hr.LeaveRequest;
import com.edupulse.core.domain.hr.LeaveStatus;
import com.edupulse.core.domain.hr.PayrollRecord;
import com.edupulse.core.domain.hr.PayrollStatus;
import com.edupulse.core.domain.hr.dto.LeaveRequestDTO;
import com.edupulse.core.domain.hr.dto.LeaveResponseDTO;
import com.edupulse.core.domain.hr.dto.LeaveReviewDTO;
import com.edupulse.core.domain.hr.dto.MonthlyPayrollRequestDTO;
import com.edupulse.core.domain.hr.dto.PayrollResponseDTO;
import com.edupulse.core.domain.hr.repository.LeaveRequestRepository;
import com.edupulse.core.domain.hr.repository.PayrollRecordRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Enterprise service implementation managing faculty leave requests and monthly payroll calculations.
 */
@Service("coreHRService")
public class HRServiceImpl implements HRService {

    private static final BigDecimal DEFAULT_FACULTY_BASE_SALARY = new BigDecimal("50000.00");

    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final FacultyRepository facultyRepository;

    public HRServiceImpl(
            @Qualifier("coreLeaveRequestRepository") LeaveRequestRepository leaveRequestRepository,
            @Qualifier("corePayrollRecordRepository") PayrollRecordRepository payrollRecordRepository,
            @Qualifier("coreFacultyRepository") FacultyRepository facultyRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.payrollRecordRepository = payrollRecordRepository;
        this.facultyRepository = facultyRepository;
    }

    @Override
    @Transactional
    public LeaveResponseDTO applyForLeave(LeaveRequestDTO request) {
        String tenantId = TenantContext.getTenantId();
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Leave end date cannot precede start date");
        }

        Faculty faculty = facultyRepository.findByIdAndTenantId(request.getFacultyId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Faculty member not found with ID: " + request.getFacultyId()));

        LeaveRequest leave = new LeaveRequest();
        leave.setFaculty(faculty);
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason());
        leave.setStatus(LeaveStatus.PENDING);

        LeaveRequest saved = leaveRequestRepository.save(leave);
        return mapToLeaveResponse(saved);
    }

    @Override
    @Transactional
    public LeaveResponseDTO reviewLeave(Long leaveId, LeaveStatus status, String reviewNotes) {
        String tenantId = TenantContext.getTenantId();
        if (status == null) {
            throw new IllegalArgumentException("Leave review status must be provided");
        }

        LeaveRequest leave = leaveRequestRepository.findByIdAndTenantId(leaveId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found with ID: " + leaveId));

        leave.setStatus(status);
        leave.setReviewNotes(reviewNotes);
        leave.setReviewedAt(LocalDateTime.now());
        leave.setReviewedBy(getCurrentReviewer());

        LeaveRequest updated = leaveRequestRepository.save(leave);
        return mapToLeaveResponse(updated);
    }

    @Override
    @Transactional
    public LeaveResponseDTO reviewLeave(Long leaveId, LeaveReviewDTO reviewDTO) {
        String reviewer = (reviewDTO.getReviewedBy() != null && !reviewDTO.getReviewedBy().isBlank())
                ? reviewDTO.getReviewedBy()
                : getCurrentReviewer();

        String tenantId = TenantContext.getTenantId();
        LeaveRequest leave = leaveRequestRepository.findByIdAndTenantId(leaveId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found with ID: " + leaveId));

        leave.setStatus(reviewDTO.getStatus());
        leave.setReviewNotes(reviewDTO.getReviewNotes());
        leave.setReviewedAt(LocalDateTime.now());
        leave.setReviewedBy(reviewer);

        LeaveRequest updated = leaveRequestRepository.save(leave);
        return mapToLeaveResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponseDTO> getPendingLeaves() {
        String tenantId = TenantContext.getTenantId();
        return leaveRequestRepository.findByStatusAndTenantId(LeaveStatus.PENDING, tenantId).stream()
                .map(this::mapToLeaveResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponseDTO> getLeavesByFaculty(Long facultyId) {
        String tenantId = TenantContext.getTenantId();
        return leaveRequestRepository.findByFacultyIdAndTenantId(facultyId, tenantId).stream()
                .map(this::mapToLeaveResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponseDTO> getAllLeaves() {
        String tenantId = TenantContext.getTenantId();
        return leaveRequestRepository.findByTenantId(tenantId).stream()
                .map(this::mapToLeaveResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<PayrollResponseDTO> generateMonthlyPayroll(Integer month, Integer year) {
        return generateMonthlyPayroll(new MonthlyPayrollRequestDTO(month, year, DEFAULT_FACULTY_BASE_SALARY));
    }

    @Override
    @Transactional
    public List<PayrollResponseDTO> generateMonthlyPayroll(MonthlyPayrollRequestDTO request) {
        String tenantId = TenantContext.getTenantId();
        Integer month = request.getMonth();
        Integer year = request.getYear();
        BigDecimal baseSalary = request.getDefaultBaseSalary() != null
                ? request.getDefaultBaseSalary()
                : DEFAULT_FACULTY_BASE_SALARY;

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();
        int daysInMonth = yearMonth.lengthOfMonth();

        List<Faculty> faculties = facultyRepository.findAllByTenantId(tenantId);
        List<PayrollResponseDTO> results = new ArrayList<>();

        for (Faculty faculty : faculties) {
            List<LeaveRequest> approvedLeaves = leaveRequestRepository
                    .findByFacultyIdAndStatusAndTenantId(faculty.getId(), LeaveStatus.APPROVED, tenantId);

            long leaveDaysInMonth = 0;
            for (LeaveRequest leave : approvedLeaves) {
                if (!leave.getEndDate().isBefore(monthStart) && !leave.getStartDate().isAfter(monthEnd)) {
                    LocalDate start = leave.getStartDate().isBefore(monthStart) ? monthStart : leave.getStartDate();
                    LocalDate end = leave.getEndDate().isAfter(monthEnd) ? monthEnd : leave.getEndDate();
                    leaveDaysInMonth += ChronoUnit.DAYS.between(start, end) + 1;
                }
            }

            BigDecimal dailyRate = baseSalary.divide(BigDecimal.valueOf(daysInMonth), 2, RoundingMode.HALF_UP);
            BigDecimal deductions = dailyRate.multiply(BigDecimal.valueOf(leaveDaysInMonth)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal netSalary = baseSalary.subtract(deductions).max(BigDecimal.ZERO);

            PayrollRecord record = payrollRecordRepository
                    .findByFacultyIdAndMonthAndYearAndTenantId(faculty.getId(), month, year, tenantId)
                    .orElseGet(() -> {
                        PayrollRecord newRecord = new PayrollRecord();
                        newRecord.setFaculty(faculty);
                        newRecord.setMonth(month);
                        newRecord.setYear(year);
                        newRecord.setStatus(PayrollStatus.GENERATED);
                        return newRecord;
                    });

            if (record.getStatus() != PayrollStatus.PAID) {
                record.setBaseSalary(baseSalary);
                record.setDeductions(deductions);
                record.setNetSalary(netSalary);
                record.setStatus(PayrollStatus.GENERATED);
                record = payrollRecordRepository.save(record);
            }

            results.add(mapToPayrollResponse(record));
        }

        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollResponseDTO> getMonthlyPayroll(Integer month, Integer year) {
        String tenantId = TenantContext.getTenantId();
        return payrollRecordRepository.findByMonthAndYearAndTenantId(month, year, tenantId).stream()
                .map(this::mapToPayrollResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PayrollResponseDTO markPayrollAsPaid(Long payrollId) {
        String tenantId = TenantContext.getTenantId();
        PayrollRecord record = payrollRecordRepository.findByIdAndTenantId(payrollId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll record not found with ID: " + payrollId));

        record.setStatus(PayrollStatus.PAID);
        record.setPaymentDate(LocalDate.now());

        PayrollRecord updated = payrollRecordRepository.save(record);
        return mapToPayrollResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollResponseDTO> getPayrollByFaculty(Long facultyId) {
        String tenantId = TenantContext.getTenantId();
        return payrollRecordRepository.findByFacultyIdAndTenantId(facultyId, tenantId).stream()
                .map(this::mapToPayrollResponse)
                .collect(Collectors.toList());
    }

    private String getCurrentReviewer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().isBlank() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return "HR_ADMIN";
    }

    private LeaveResponseDTO mapToLeaveResponse(LeaveRequest leave) {
        Faculty f = leave.getFaculty();
        String facultyName = f != null ? f.getFirstName() + " " + f.getLastName() : "Unknown";
        String employeeId = f != null ? f.getEmployeeId() : null;
        String deptName = (f != null && f.getDepartment() != null) ? f.getDepartment().getName() : null;

        return LeaveResponseDTO.builder()
                .id(leave.getId())
                .facultyId(f != null ? f.getId() : null)
                .facultyName(facultyName)
                .employeeId(employeeId)
                .departmentName(deptName)
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .daysCount(leave.getDaysCount())
                .reason(leave.getReason())
                .status(leave.getStatus())
                .reviewedBy(leave.getReviewedBy())
                .reviewNotes(leave.getReviewNotes())
                .reviewedAt(leave.getReviewedAt())
                .build();
    }

    private PayrollResponseDTO mapToPayrollResponse(PayrollRecord record) {
        Faculty f = record.getFaculty();
        String facultyName = f != null ? f.getFirstName() + " " + f.getLastName() : "Unknown";
        String employeeId = f != null ? f.getEmployeeId() : null;
        String deptName = (f != null && f.getDepartment() != null) ? f.getDepartment().getName() : null;

        return PayrollResponseDTO.builder()
                .id(record.getId())
                .facultyId(f != null ? f.getId() : null)
                .facultyName(facultyName)
                .employeeId(employeeId)
                .departmentName(deptName)
                .month(record.getMonth())
                .year(record.getYear())
                .baseSalary(record.getBaseSalary())
                .deductions(record.getDeductions())
                .netSalary(record.getNetSalary())
                .paymentDate(record.getPaymentDate())
                .status(record.getStatus())
                .build();
    }
}

