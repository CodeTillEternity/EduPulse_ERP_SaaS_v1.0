package com.edupulse.core.domain.hr.repository;

import com.edupulse.core.domain.hr.PayrollRecord;
import com.edupulse.core.domain.hr.PayrollStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for PayrollRecord entities partitioned by tenantId.
 */
@Repository("corePayrollRecordRepository")
public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {

    List<PayrollRecord> findByFacultyIdAndTenantId(Long facultyId, String tenantId);

    Optional<PayrollRecord> findByFacultyIdAndMonthAndYearAndTenantId(Long facultyId, Integer month, Integer year, String tenantId);

    List<PayrollRecord> findByMonthAndYearAndTenantId(Integer month, Integer year, String tenantId);

    List<PayrollRecord> findByTenantId(String tenantId);

    Optional<PayrollRecord> findByIdAndTenantId(Long id, String tenantId);

    List<PayrollRecord> findByStatusAndTenantId(PayrollStatus status, String tenantId);
}
