package com.edupulse.core.domain.library.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for issuing a book asset to an enrolled student.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueRequestDTO {

    @NotNull(message = "Book asset ID is required")
    private Long bookId;

    @NotNull(message = "Student ID is required")
    private Long studentId;
}
