package com.edupulse.core.domain.academic.repository;

import com.edupulse.core.domain.academic.ExamSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("coreExamSubmissionRepository")
public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {

    Optional<ExamSubmission> findByExamIdAndStudentIdAndTenantId(Long examId, Long studentId, String tenantId);

    List<ExamSubmission> findByExamIdAndTenantId(Long examId, String tenantId);

    List<ExamSubmission> findByStudentIdAndTenantId(Long studentId, String tenantId);

    Optional<ExamSubmission> findByIdAndTenantId(Long id, String tenantId);
}
