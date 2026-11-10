package com.erp.disaster_recovery.scheduler;

import com.erp.common.storage.S3StorageService;
import com.erp.disaster_recovery.entity.BackupStatus;
import com.erp.disaster_recovery.entity.DisasterRecoveryLog;
import com.erp.disaster_recovery.repository.DisasterRecoveryLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.GZIPOutputStream;

/**
 * Automated Disaster Recovery Scheduler via S3.
 * Executes daily at 2:00 AM, dumps primary multi-tenant database using native pg_dump via ProcessBuilder,
 * compresses output into a .gz stream, and pipes directly to S3StorageService without writing to ephemeral disk.
 */
@Service
@EnableScheduling
public class DatabaseBackupScheduler {

    private static final Logger log = LoggerFactory.getLogger(DatabaseBackupScheduler.class);

    private static final DateTimeFormatter BACKUP_TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");

    private static final Pattern POSTGRES_URL_PATTERN = Pattern.compile("jdbc:postgresql://([^:/]+)(?::(\\d+))?/([^?]+)");

    private final S3StorageService s3StorageService;
    private final DisasterRecoveryLogRepository drLogRepository;

    @Value("${backup.pgdump-path:pg_dump}")
    private String pgDumpBinary;

    @Value("${multitenancy.datasources.primary.jdbc-url:${spring.datasource.url:jdbc:postgresql://localhost:5432/edupulse}}")
    private String jdbcUrl;

    @Value("${multitenancy.datasources.primary.username:${spring.datasource.username:postgres}}")
    private String dbUsername;

    @Value("${multitenancy.datasources.primary.password:${spring.datasource.password:postgres}}")
    private String dbPassword;

    public DatabaseBackupScheduler(
            S3StorageService s3StorageService,
            DisasterRecoveryLogRepository drLogRepository) {
        this.s3StorageService = s3StorageService;
        this.drLogRepository = drLogRepository;
    }

    /**
     * Executes automated disaster recovery backup daily at 2:00 AM.
     */
    @Scheduled(cron = "${backup.cron:0 0 2 * * ?}")
    public DisasterRecoveryLog performScheduledBackup() {
        log.info("Triggering scheduled disaster recovery backup at {}", LocalDateTime.now());
        return executeBackup();
    }

    /**
     * Executes the backup process: invokes pg_dump via ProcessBuilder, compresses to GZIP in memory,
     * uploads to S3, and persists audit log.
     *
     * @return Created DisasterRecoveryLog record
     */
    public DisasterRecoveryLog executeBackup() {
        long startTime = System.currentTimeMillis();
        LocalDateTime backupTime = LocalDateTime.now();
        String s3Key = "backups/edupulse-backup-" + backupTime.format(BACKUP_TIMESTAMP_FORMAT) + ".sql.gz";

        log.info("Initiating native pg_dump disaster recovery backup to S3 key: [{}]", s3Key);

        try {
            byte[] compressedData = executePgDumpAndCompress();

            // Pipe directly to S3StorageService without writing to local ephemeral disk
            String s3Url = s3StorageService.uploadFile(
                    s3Key,
                    new ByteArrayInputStream(compressedData),
                    "application/gzip",
                    compressedData.length
            );

            long durationMs = System.currentTimeMillis() - startTime;
            log.info("Disaster recovery backup successful: S3 URL [{}], size [{} bytes], duration [{} ms]",
                    s3Url, compressedData.length, durationMs);

            DisasterRecoveryLog logEntry = new DisasterRecoveryLog(
                    backupTime,
                    s3Url,
                    BackupStatus.SUCCESS,
                    (long) compressedData.length,
                    durationMs,
                    null
            );
            return drLogRepository.save(logEntry);

        } catch (Exception ex) {
            long durationMs = System.currentTimeMillis() - startTime;
            log.error("Disaster recovery backup failed after {} ms: {}", durationMs, ex.getMessage(), ex);

            DisasterRecoveryLog failedLog = new DisasterRecoveryLog(
                    backupTime,
                    null,
                    BackupStatus.FAILED,
                    0L,
                    durationMs,
                    ex.getMessage()
            );
            return drLogRepository.save(failedLog);
        }
    }

    /**
     * Streams pg_dump process output directly into a GZIPOutputStream in memory.
     */
    private byte[] executePgDumpAndCompress() throws Exception {
        PostgresConnectionParams params = parseJdbcUrl(jdbcUrl);

        List<String> command = new ArrayList<>();
        command.add(pgDumpBinary);
        command.add("-h");
        command.add(params.host());
        command.add("-p");
        command.add(String.valueOf(params.port()));
        command.add("-U");
        command.add(dbUsername != null ? dbUsername : "postgres");
        command.add("-d");
        command.add(params.database());
        command.add("--no-owner");
        command.add("--no-privileges");

        log.info("Executing pg_dump process: host=[{}:{}], db=[{}], user=[{}]",
                params.host(), params.port(), params.database(), dbUsername);

        ProcessBuilder pb = new ProcessBuilder(command);
        if (dbPassword != null && !dbPassword.isBlank()) {
            pb.environment().put("PGPASSWORD", dbPassword);
        }

        Process process = pb.start();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (InputStream procOut = process.getInputStream();
             GZIPOutputStream gzipOut = new GZIPOutputStream(baos)) {
            procOut.transferTo(gzipOut);
            gzipOut.finish();
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            String errorOutput = new String(process.getErrorStream().readAllBytes());
            throw new IllegalStateException("pg_dump process failed with exit code " + exitCode + ": " + errorOutput);
        }

        return baos.toByteArray();
    }

    /**
     * Compresses an explicit raw SQL input stream directly to GZIP for testing or fallback.
     */
    public byte[] compressSqlStream(InputStream sqlInput) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (GZIPOutputStream gzipOut = new GZIPOutputStream(baos)) {
            sqlInput.transferTo(gzipOut);
            gzipOut.finish();
        }
        return baos.toByteArray();
    }

    private PostgresConnectionParams parseJdbcUrl(String url) {
        if (url == null || url.isBlank()) {
            return new PostgresConnectionParams("localhost", 5432, "edupulse");
        }

        Matcher matcher = POSTGRES_URL_PATTERN.matcher(url);
        if (matcher.find()) {
            String host = matcher.group(1);
            int port = matcher.group(2) != null ? Integer.parseInt(matcher.group(2)) : 5432;
            String db = matcher.group(3);
            return new PostgresConnectionParams(host, port, db);
        }

        // Default fallback for H2 or non-postgres URLs in testing
        return new PostgresConnectionParams("localhost", 5432, "edupulse");
    }

    public void setPgDumpBinary(String pgDumpBinary) {
        this.pgDumpBinary = pgDumpBinary;
    }

    public void setJdbcUrl(String jdbcUrl) {
        this.jdbcUrl = jdbcUrl;
    }

    public void setDbUsername(String dbUsername) {
        this.dbUsername = dbUsername;
    }

    public void setDbPassword(String dbPassword) {
        this.dbPassword = dbPassword;
    }

    private record PostgresConnectionParams(String host, int port, String database) {}
}
