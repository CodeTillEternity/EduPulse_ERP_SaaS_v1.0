package com.edupulse.core.domain.finance.repository;

import com.edupulse.core.domain.finance.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for FeePayment transactions.
 */
@Repository("coreFeePaymentRepository")
public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {

    List<FeePayment> findByStudentInvoiceIdAndTenantId(Long studentInvoiceId, String tenantId);

    List<FeePayment> findByTenantId(String tenantId);

    Optional<FeePayment> findByIdAndTenantId(Long id, String tenantId);
}
