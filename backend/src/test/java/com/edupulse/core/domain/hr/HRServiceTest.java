package com.edupulse.core.domain.hr;

import com.edupulse.core.domain.academic.Faculty;
import com.edupulse.core.domain.academic.repository.FacultyRepository;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.hr.dto.LeaveRequestDTO;
import com.edupulse.core.domain.hr.dto.LeaveResponseDTO;
import com.edupulse.core.domain.hr.dto.LeaveReviewDTO;
import com.edupulse.core.domain.hr.dto.MonthlyPayrollRequestDTO;
import com.edupulse.core.domain.hr.dto.PayrollResponseDTO;
import com.edupulse.core.domain.hr.repository.LeaveRequestRepository;
import com.edupulse.core.domain.hr.repository.PayrollRecordRepository;
import com.edupulse.core.domain.hr.service.HRServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HRServiceTest {

    private static final String TENANT_ID = "tenant-hr-test-01";

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private PayrollRecordRepository payrollRecordRepository;

    @Mock
    private FacultyRepository facultyRepository;

    @InjectMocks
    private HRServiceImpl hrService;

    private Faculty sampleFaculty;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);

        sampleFaculty = new Faculty();
        sampleFaculty.setId(101L);
        sampleFaculty.setEmployeeId("FAC-101");
        sampleFaculty.setFirstName("Ada");
        sampleFaculty.setLastName("Lovelace");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("applyForLeave successfully persists leave request and returns DTO")
    void shouldApplyForLeave() {
        LocalDate start = LocalDate.of(2026, 11, 10);
        LocalDate end = LocalDate.of(2026, 11, 12);
        LeaveRequestDTO dto = new LeaveRequestDTO(101L, start, end, "Medical conference");

        when(facultyRepository.findByIdAndTenantId(101L, TENANT_ID)).thenReturn(Optional.of(sampleFaculty));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> {
            LeaveRequest req = invocation.getArgument(0);
            req.setId(1L);
            return req;
        });

        LeaveResponseDTO response = hrService.applyForLeave(dto);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getFacultyId()).isEqualTo(101L);
        assertThat(response.getFacultyName()).isEqualTo("Ada Lovelace");
        assertThat(response.getStatus()).isEqualTo(LeaveStatus.PENDING);
        assertThat(response.getDaysCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("applyForLeave throws exception if end date is before start date")
    void shouldRejectInvalidDatesOnLeaveApplication() {
        LeaveRequestDTO dto = new LeaveRequestDTO(101L, LocalDate.of(2026, 11, 15), LocalDate.of(2026, 11, 10), "Invalid");

        assertThatThrownBy(() -> hrService.applyForLeave(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Leave end date cannot precede start date");
    }

    @Test
    @DisplayName("reviewLeave approves leave and updates review notes and timestamp")
    void shouldReviewLeave() {
        LeaveRequest leave = new LeaveRequest();
        leave.setId(5L);
        leave.setFaculty(sampleFaculty);
        leave.setStartDate(LocalDate.of(2026, 11, 1));
        leave.setEndDate(LocalDate.of(2026, 11, 3));
        leave.setStatus(LeaveStatus.PENDING);

        when(leaveRequestRepository.findByIdAndTenantId(5L, TENANT_ID)).thenReturn(Optional.of(leave));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeaveReviewDTO reviewDTO = new LeaveReviewDTO(LeaveStatus.APPROVED, "Approved by HOD", "HOD_ADMIN");
        LeaveResponseDTO response = hrService.reviewLeave(5L, reviewDTO);

        assertThat(response.getStatus()).isEqualTo(LeaveStatus.APPROVED);
        assertThat(response.getReviewNotes()).isEqualTo("Approved by HOD");
        assertThat(response.getReviewedBy()).isEqualTo("HOD_ADMIN");
        assertThat(response.getReviewedAt()).isNotNull();
    }

    @Test
    @DisplayName("generateMonthlyPayroll calculates leave deductions and creates payroll records")
    void shouldGenerateMonthlyPayroll() {
        when(facultyRepository.findAllByTenantId(TENANT_ID)).thenReturn(List.of(sampleFaculty));

        LeaveRequest leave = new LeaveRequest();
        leave.setId(20L);
        leave.setFaculty(sampleFaculty);
        leave.setStartDate(LocalDate.of(2026, 11, 5));
        leave.setEndDate(LocalDate.of(2026, 11, 7)); // 3 days in November
        leave.setStatus(LeaveStatus.APPROVED);

        when(leaveRequestRepository.findByFacultyIdAndStatusAndTenantId(101L, LeaveStatus.APPROVED, TENANT_ID))
                .thenReturn(List.of(leave));
        when(payrollRecordRepository.findByFacultyIdAndMonthAndYearAndTenantId(101L, 11, 2026, TENANT_ID))
                .thenReturn(Optional.empty());
        when(payrollRecordRepository.save(any(PayrollRecord.class))).thenAnswer(invocation -> {
            PayrollRecord rec = invocation.getArgument(0);
            rec.setId(301L);
            return rec;
        });

        MonthlyPayrollRequestDTO request = new MonthlyPayrollRequestDTO(11, 2026, new BigDecimal("60000.00"));
        List<PayrollResponseDTO> results = hrService.generateMonthlyPayroll(request);

        assertThat(results).hasSize(1);
        PayrollResponseDTO payslip = results.get(0);
        assertThat(payslip.getFacultyId()).isEqualTo(101L);
        assertThat(payslip.getMonth()).isEqualTo(11);
        assertThat(payslip.getYear()).isEqualTo(2026);
        assertThat(payslip.getBaseSalary()).isEqualByComparingTo("60000.00");
        // November has 30 days. Daily rate = 60000 / 30 = 2000. 3 leave days = 6000 deductions.
        assertThat(payslip.getDeductions()).isEqualByComparingTo("6000.00");
        assertThat(payslip.getNetSalary()).isEqualByComparingTo("54000.00");
        assertThat(payslip.getStatus()).isEqualTo(PayrollStatus.GENERATED);
    }

    @Test
    @DisplayName("markPayrollAsPaid transitions status to PAID with today's date")
    void shouldMarkPayrollAsPaid() {
        PayrollRecord record = new PayrollRecord();
        record.setId(401L);
        record.setFaculty(sampleFaculty);
        record.setMonth(11);
        record.setYear(2026);
        record.setBaseSalary(new BigDecimal("50000.00"));
        record.setDeductions(BigDecimal.ZERO);
        record.setNetSalary(new BigDecimal("50000.00"));
        record.setStatus(PayrollStatus.GENERATED);

        when(payrollRecordRepository.findByIdAndTenantId(401L, TENANT_ID)).thenReturn(Optional.of(record));
        when(payrollRecordRepository.save(any(PayrollRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PayrollResponseDTO response = hrService.markPayrollAsPaid(401L);

        assertThat(response.getStatus()).isEqualTo(PayrollStatus.PAID);
        assertThat(response.getPaymentDate()).isEqualTo(LocalDate.now());
    }
}

