package com.edupulse.core.domain.academic.repository;

import com.edupulse.core.domain.academic.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("coreExamQuestionRepository")
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {

    List<ExamQuestion> findByExamIdAndTenantIdOrderByOrderIndexAsc(Long examId, String tenantId);

    Optional<ExamQuestion> findByIdAndTenantId(Long id, String tenantId);
}
