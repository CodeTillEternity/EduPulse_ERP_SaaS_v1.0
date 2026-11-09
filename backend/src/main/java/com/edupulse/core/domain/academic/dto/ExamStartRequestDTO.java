package com.edupulse.core.domain.academic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamStartRequestDTO {

    @NotBlank(message = "Exam PIN is required to commence exam session")
    private String examPin;

    public String getPin() {
        return examPin;
    }

    public void setPin(String pin) {
        this.examPin = pin;
    }
}
