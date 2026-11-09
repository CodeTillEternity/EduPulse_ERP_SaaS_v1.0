package com.edupulse.core.domain.library.dto;

import com.edupulse.core.domain.library.IssueStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Response DTO representing an issued book circulation record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueResponseDTO {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String isbn;
    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private IssueStatus status;
    private String tenantId;
}
