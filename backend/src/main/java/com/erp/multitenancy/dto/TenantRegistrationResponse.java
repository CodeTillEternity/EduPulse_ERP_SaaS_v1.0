package com.erp.multitenancy.dto;

import com.erp.multitenancy.model.TenantStatus;
import java.time.LocalDateTime;

public class TenantRegistrationResponse {

    private String tenantId;
    private TenantStatus status;
    private LocalDateTime trialEndDate;
    private String institutionName;
    private String adminEmail;
    private String message;

    public TenantRegistrationResponse() {}

    public TenantRegistrationResponse(String tenantId, TenantStatus status, LocalDateTime trialEndDate) {
        this.tenantId = tenantId;
        this.status = status;
        this.trialEndDate = trialEndDate;
    }

    public TenantRegistrationResponse(String tenantId, TenantStatus status, LocalDateTime trialEndDate,
                                      String institutionName, String adminEmail, String message) {
        this.tenantId = tenantId;
        this.status = status;
        this.trialEndDate = trialEndDate;
        this.institutionName = institutionName;
        this.adminEmail = adminEmail;
        this.message = message;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public TenantStatus getStatus() {
        return status;
    }

    public void setStatus(TenantStatus status) {
        this.status = status;
    }

    public LocalDateTime getTrialEndDate() {
        return trialEndDate;
    }

    public void setTrialEndDate(LocalDateTime trialEndDate) {
        this.trialEndDate = trialEndDate;
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
