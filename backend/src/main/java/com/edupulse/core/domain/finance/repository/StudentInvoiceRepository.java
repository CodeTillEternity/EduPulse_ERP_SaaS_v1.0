package com.edupulse.core.domain.finance.repository;

import com.edupulse.core.domain.finance.StudentInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for StudentInvoice entities with multi-tenant partition filters.
 */
@Repository("coreStudentInvoiceRepository")
public interface StudentInvoiceRepository extends JpaRepository<StudentInvoice, Long> {

    List<StudentInvoice> findByStudentIdAndTenantId(Long studentId, String tenantId);

    List<StudentInvoice> findByStudent_EnrollmentNumberAndTenantId(String enrollmentNumber, String tenantId);

    List<StudentInvoice> findByFeeStructureIdAndTenantId(Long feeStructureId, String tenantId);

    Optional<StudentInvoice> findByInvoiceNumberAndTenantId(String invoiceNumber, String tenantId);

    Optional<StudentInvoice> findByIdAndTenantId(Long id, String tenantId);

    List<StudentInvoice> findByTenantId(String tenantId);

    Page<StudentInvoice> findByTenantId(String tenantId, Pageable pageable);

    Page<StudentInvoice> findByTenantIdAndStatus(String tenantId, com.edupulse.core.domain.finance.InvoiceStatus status, Pageable pageable);

    boolean existsByStudentIdAndFeeStructureIdAndTenantId(Long studentId, Long feeStructureId, String tenantId);
}
