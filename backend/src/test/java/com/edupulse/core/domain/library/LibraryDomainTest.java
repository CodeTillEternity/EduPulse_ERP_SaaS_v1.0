package com.edupulse.core.domain.library;

import com.edupulse.core.domain.student.Student;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class LibraryDomainTest {

    @Test
    @DisplayName("BookAsset entity instantiates with valid catalog metadata and tenant isolation")
    void shouldCreateBookAssetEntity() {
        BookAsset book = BookAsset.builder()
                .title("Introduction to Algorithms")
                .author("Thomas H. Cormen")
                .isbn("978-0262033848")
                .totalCopies(10)
                .availableCopies(8)
                .build();
        book.setId(1L);
        book.setTenantId("tenant-cambridge");

        assertThat(book.getId()).isEqualTo(1L);
        assertThat(book.getTitle()).isEqualTo("Introduction to Algorithms");
        assertThat(book.getAuthor()).isEqualTo("Thomas H. Cormen");
        assertThat(book.getIsbn()).isEqualTo("978-0262033848");
        assertThat(book.getTotalCopies()).isEqualTo(10);
        assertThat(book.getAvailableCopies()).isEqualTo(8);
        assertThat(book.getTenantId()).isEqualTo("tenant-cambridge");
    }

    @Test
    @DisplayName("LibraryIssue entity links BookAsset and Student with proper circulation lifecycle")
    void shouldCreateLibraryIssueEntity() {
        BookAsset book = BookAsset.builder()
                .title("Operating System Concepts")
                .author("Silberschatz")
                .isbn("978-1118063330")
                .totalCopies(5)
                .availableCopies(4)
                .build();

        Student student = new Student();
        student.setId(101L);
        student.setEnrollmentNumber("STU-CS-001");
        student.setFirstName("Ada");
        student.setLastName("Lovelace");

        LocalDate today = LocalDate.now();
        LocalDate due = today.plusDays(14);

        LibraryIssue issue = LibraryIssue.builder()
                .bookAsset(book)
                .student(student)
                .issueDate(today)
                .dueDate(due)
                .status(IssueStatus.ISSUED)
                .build();
        issue.setId(201L);
        issue.setTenantId("tenant-cambridge");

        assertThat(issue.getId()).isEqualTo(201L);
        assertThat(issue.getBookAsset().getTitle()).isEqualTo("Operating System Concepts");
        assertThat(issue.getStudent().getEnrollmentNumber()).isEqualTo("STU-CS-001");
        assertThat(issue.getIssueDate()).isEqualTo(today);
        assertThat(issue.getDueDate()).isEqualTo(due);
        assertThat(issue.getReturnDate()).isNull();
        assertThat(issue.getStatus()).isEqualTo(IssueStatus.ISSUED);
        assertThat(issue.getTenantId()).isEqualTo("tenant-cambridge");
    }

    @Test
    @DisplayName("IssueStatus enum values include ISSUED, RETURNED, and OVERDUE")
    void shouldSupportExpectedIssueStatuses() {
        assertThat(IssueStatus.valueOf("ISSUED")).isEqualTo(IssueStatus.ISSUED);
        assertThat(IssueStatus.valueOf("RETURNED")).isEqualTo(IssueStatus.RETURNED);
        assertThat(IssueStatus.valueOf("OVERDUE")).isEqualTo(IssueStatus.OVERDUE);
    }
}
