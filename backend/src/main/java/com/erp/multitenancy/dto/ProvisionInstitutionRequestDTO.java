package com.erp.multitenancy.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ProvisionInstitutionRequestDTO(
        @NotBlank(message = "Institution name is required")
        String name,

        @NotBlank(message = "Admin email is required")
        @Email(message = "Valid email format required")
        String email
) {}

