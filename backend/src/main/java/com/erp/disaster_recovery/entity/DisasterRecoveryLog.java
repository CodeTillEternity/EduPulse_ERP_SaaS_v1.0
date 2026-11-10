package com.erp.disaster_recovery.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity tracking the execution history, S3 destination, size, and status of automated
 * database disaster recovery backups.
 */
@Entity
@Table(
        name = "disaster_recovery_logs",
        indexes = {
                @Index(name = "idx_dr_log_status", columnList = "status"),
                @Index(name = "idx_dr_log_timestamp", columnList = "timestamp")
        }
)
public class DisasterRecoveryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "s3_url", length = 1024)
    private String s3Url;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private BackupStatus status;

    @Column(name = "backup_size_bytes")
    private Long backupSizeBytes;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "error_message", length = 2048)
    private String errorMessage;

    public DisasterRecoveryLog() {
    }

    public DisasterRecoveryLog(LocalDateTime timestamp, String s3Url, BackupStatus status,
                               Long backupSizeBytes, Long durationMs, String errorMessage) {
        this.timestamp = timestamp;
        this.s3Url = s3Url;
        this.status = status;
        this.backupSizeBytes = backupSizeBytes;
        this.durationMs = durationMs;
        this.errorMessage = errorMessage;
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getS3Url() {
        return s3Url;
    }

    public void setS3Url(String s3Url) {
        this.s3Url = s3Url;
    }

    public BackupStatus getStatus() {
        return status;
    }

    public void setStatus(BackupStatus status) {
        this.status = status;
    }

    public Long getBackupSizeBytes() {
        return backupSizeBytes;
    }

    public void setBackupSizeBytes(Long backupSizeBytes) {
        this.backupSizeBytes = backupSizeBytes;
    }

    public Long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(Long durationMs) {
        this.durationMs = durationMs;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
