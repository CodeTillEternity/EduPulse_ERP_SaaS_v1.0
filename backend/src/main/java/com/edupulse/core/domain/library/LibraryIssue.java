package com.edupulse.core.domain.library;

import com.edupulse.core.domain.base.BaseTenantEntity;
import com.edupulse.core.domain.student.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDate;

/**
 * Domain entity recording the physical lending circulation of a BookAsset to an enrolled Student.
 * Automatically partitions by tenantId via BaseTenantEntity.
 */
@Entity(name = "LibraryCoreIssue")
@Table(name = "library_issues")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class LibraryIssue extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_asset_id", nullable = false)
    private BookAsset bookAsset;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private IssueStatus status;
}
