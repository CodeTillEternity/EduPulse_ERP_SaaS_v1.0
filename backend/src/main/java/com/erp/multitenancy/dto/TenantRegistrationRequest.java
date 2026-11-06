package com.erp.multitenancy.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TenantRegistrationRequest {

    @NotBlank(message = "Institution name is required")
    @Size(min = 2, max = 255, message = "Institution name must be between 2 and 255 characters")
    private String institutionName;

    @NotBlank(message = "Admin email is required")
    @Email(message = "Admin email must be a valid email address")
    private String adminEmail;

    @NotBlank(message = "Admin name is required")
    @Size(min = 2, max = 100, message = "Admin name must be between 2 and 100 characters")
    private String adminName;

    private String adminPassword;

    public TenantRegistrationRequest() {}

    public TenantRegistrationRequest(String institutionName, String adminEmail, String adminName) {
        this.institutionName = institutionName;
        this.adminEmail = adminEmail;
        this.adminName = adminName;
    }

    public TenantRegistrationRequest(String institutionName, String adminEmail, String adminName, String adminPassword) {
        this.institutionName = institutionName;
        this.adminEmail = adminEmail;
        this.adminName = adminName;
        this.adminPassword = adminPassword;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getAdminPassword() {
        return adminPassword;
    }

    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword;
    }
}
