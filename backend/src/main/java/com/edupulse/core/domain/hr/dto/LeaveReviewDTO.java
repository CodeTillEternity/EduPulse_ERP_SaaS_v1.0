package com.edupulse.core.domain.hr.dto;

import com.edupulse.core.domain.hr.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveReviewDTO {

    @NotNull(message = "Leave status is required")
    private LeaveStatus status;

    private String reviewNotes;

    private String reviewedBy;
}

