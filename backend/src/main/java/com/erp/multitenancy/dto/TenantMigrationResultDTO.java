package com.erp.multitenancy.dto;

import com.erp.multitenancy.model.AccountStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Result summary of automated tenant infrastructure migration")
public record TenantMigrationResultDTO(
        @Schema(description = "Migrated tenant identifier")
        String tenantId,

        @Schema(description = "Assigned database routing key")
        String databaseRoutingKey,

        @Schema(description = "Updated database mode (e.g. DEDICATED)")
        String databaseMode,

        @Schema(description = "Final account status after migration restoration")
        AccountStatus accountStatus,

        @Schema(description = "Number of database tables processed during migration")
        int migratedTablesCount,

        @Schema(description = "Total number of row records securely copied to dedicated pool")
        long totalRowsMigrated,

        @Schema(description = "Timestamp when migration completed")
        LocalDateTime completedAt,

        @Schema(description = "Status message")
        String message
) {}

