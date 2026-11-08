package com.edupulse.core.domain.hr.repository;

import com.edupulse.core.domain.hr.LeaveRequest;
import com.edupulse.core.domain.hr.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for LeaveRequest entities partitioned by tenantId.
 */
@Repository("coreLeaveRequestRepository")
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByFacultyIdAndTenantId(Long facultyId, String tenantId);

    List<LeaveRequest> findByStatusAndTenantId(LeaveStatus status, String tenantId);

    List<LeaveRequest> findByFacultyIdAndStatusAndTenantId(Long facultyId, LeaveStatus status, String tenantId);

    List<LeaveRequest> findByTenantId(String tenantId);

    Optional<LeaveRequest> findByIdAndTenantId(Long id, String tenantId);

    List<LeaveRequest> findByFacultyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndTenantId(
            Long facultyId, LocalDate endDate, LocalDate startDate, String tenantId);
}
