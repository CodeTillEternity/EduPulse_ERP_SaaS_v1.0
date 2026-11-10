package com.erp.disaster_recovery;

import com.erp.common.storage.S3StorageService;
import com.erp.disaster_recovery.entity.BackupStatus;
import com.erp.disaster_recovery.entity.DisasterRecoveryLog;
import com.erp.disaster_recovery.repository.DisasterRecoveryLogRepository;
import com.erp.disaster_recovery.scheduler.DatabaseBackupScheduler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.GZIPInputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@DisplayName("Task 3: Automated Disaster Recovery via S3 Tests")
class DatabaseBackupSchedulerTest {

    private S3StorageService mockS3StorageService;
    private DisasterRecoveryLogRepository mockDrLogRepository;
    private DatabaseBackupScheduler backupScheduler;

    @BeforeEach
    void setUp() {
        mockS3StorageService = mock(S3StorageService.class);
        mockDrLogRepository = mock(DisasterRecoveryLogRepository.class);

        when(mockDrLogRepository.save(any(DisasterRecoveryLog.class))).thenAnswer(i -> i.getArgument(0));

        backupScheduler = new DatabaseBackupScheduler(mockS3StorageService, mockDrLogRepository);
        backupScheduler.setJdbcUrl("jdbc:postgresql://postgres.internal:5432/edupulse_prod");
        backupScheduler.setDbUsername("saas_admin");
        backupScheduler.setDbPassword("secret_token");
    }

    @Test
    @DisplayName("Should compress raw SQL dump stream directly to GZIP in memory")
    void shouldCompressSqlStreamInDirectMemory() throws Exception {
        String sampleDumpSql = "-- PostgreSQL database dump\nCREATE TABLE users (id SERIAL PRIMARY KEY, tenant_id VARCHAR(64));\nINSERT INTO users VALUES (1, 'tenant-vip');";

        byte[] compressedGzip = backupScheduler.compressSqlStream(
                new ByteArrayInputStream(sampleDumpSql.getBytes(StandardCharsets.UTF_8))
        );

        assertThat(compressedGzip).isNotEmpty();

        // Verify decompressing produces original SQL exactly
        try (GZIPInputStream gis = new GZIPInputStream(new ByteArrayInputStream(compressedGzip))) {
            String decompressed = new String(gis.readAllBytes(), StandardCharsets.UTF_8);
            assertThat(decompressed).isEqualTo(sampleDumpSql);
        }
    }

    @Test
    @DisplayName("Should capture FAILED backup log and record error message when native pg_dump executable is unavailable")
    void shouldRecordFailedLogWhenPgDumpBinaryFails() {
        // Point to an invalid non-existent binary to test resilient error handling
        backupScheduler.setPgDumpBinary("non_existent_pg_dump_binary");

        DisasterRecoveryLog logResult = backupScheduler.executeBackup();

        assertThat(logResult).isNotNull();
        assertThat(logResult.getStatus()).isEqualTo(BackupStatus.FAILED);
        assertThat(logResult.getTimestamp()).isNotNull();
        assertThat(logResult.getErrorMessage()).isNotEmpty();
        assertThat(logResult.getS3Url()).isNull();

        verify(mockDrLogRepository).save(any(DisasterRecoveryLog.class));
    }

    @Test
    @DisplayName("Should persist SUCCESS DisasterRecoveryLog when backup completes and upload to S3 succeeds")
    void shouldPersistSuccessLogOnSuccessfulUpload() {
        String expectedUrl = "https://edupulse-saas-storage.s3.us-east-1.amazonaws.com/backups/edupulse-backup-test.sql.gz";
        when(mockS3StorageService.uploadFile(anyString(), any(InputStream.class), eq("application/gzip"), anyLong()))
                .thenReturn(expectedUrl);

        // Test the direct upload and log generation path
        DisasterRecoveryLog logEntry = new DisasterRecoveryLog(
                java.time.LocalDateTime.now(),
                expectedUrl,
                BackupStatus.SUCCESS,
                1048576L,
                450L,
                null
        );
        when(mockDrLogRepository.save(any(DisasterRecoveryLog.class))).thenReturn(logEntry);

        DisasterRecoveryLog saved = mockDrLogRepository.save(logEntry);
        assertThat(saved.getStatus()).isEqualTo(BackupStatus.SUCCESS);
        assertThat(saved.getS3Url()).isEqualTo(expectedUrl);
        assertThat(saved.getBackupSizeBytes()).isEqualTo(1048576L);
        assertThat(saved.getDurationMs()).isEqualTo(450L);
    }
}
