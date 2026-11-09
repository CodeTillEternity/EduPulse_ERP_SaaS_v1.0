package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.base.BaseTenantEntity;
import com.edupulse.core.domain.student.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Domain entity capturing student examination submissions, proctoring security hashes,
 * evaluated marks, and tenant boundary isolation.
 */
@Entity(name = "AcademicCoreExamSubmission")
@Table(name = "academic_exam_submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class ExamSubmission extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "score", precision = 7, scale = 2)
    private BigDecimal score;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson;

    @Column(name = "client_ip", length = 64)
    private String clientIp;

    @Column(name = "seb_request_hash", length = 128)
    private String sebRequestHash;
}
