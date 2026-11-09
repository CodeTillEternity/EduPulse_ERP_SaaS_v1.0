package com.edupulse.core.domain.library.repository;

import com.edupulse.core.domain.library.IssueStatus;
import com.edupulse.core.domain.library.LibraryIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for physical LibraryIssue circulation logs.
 */
@Repository("coreLibraryIssueRepository")
public interface LibraryIssueRepository extends JpaRepository<LibraryIssue, Long> {

    List<LibraryIssue> findByTenantId(String tenantId);

    Optional<LibraryIssue> findByIdAndTenantId(Long id, String tenantId);

    List<LibraryIssue> findByStudentIdAndTenantId(Long studentId, String tenantId);

    List<LibraryIssue> findByBookAssetIdAndTenantId(Long bookAssetId, String tenantId);

    List<LibraryIssue> findByStatusAndTenantId(IssueStatus status, String tenantId);

    List<LibraryIssue> findByStatusNotAndTenantId(IssueStatus status, String tenantId);

    List<LibraryIssue> findByStudentIdAndStatusAndTenantId(Long studentId, IssueStatus status, String tenantId);
}
