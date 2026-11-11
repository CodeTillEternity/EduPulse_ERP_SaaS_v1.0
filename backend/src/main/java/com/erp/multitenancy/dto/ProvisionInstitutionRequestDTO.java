package com.erp.multitenancy.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ProvisionInstitutionRequestDTO(
        @NotBlank(message = "Institution name is required")
        @JsonAlias({"institutionName", "name"})
        String name,

        @NotBlank(message = "Admin email is required")
        @Email(message = "Valid email format required")
        @JsonAlias({"adminEmail", "email"})
        String email,

        @JsonAlias({"adminPassword", "password"})
        String password,

        @JsonAlias({"adminName", "fullName"})
        String fullName
) {
    public ProvisionInstitutionRequestDTO(String name, String email) {
        this(name, email, null, null);
    }
}
