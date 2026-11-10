package com.erp.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequestDTO {

    @NotBlank(message = "Registered email address is required")
    @Email(message = "Please provide a valid registered email address")
    private String email;

    @NotBlank(message = "Institutional ID (Admission No. / Employee ID) is required")
    private String institutionalId;
}
