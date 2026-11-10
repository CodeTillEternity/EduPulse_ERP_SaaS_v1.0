package com.erp.multitenancy.dto;

import com.erp.multitenancy.model.AccountStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTenantStatusDTO(
        @NotNull(message = "accountStatus is required")
        AccountStatus accountStatus
) {}

