package com.erp.common.storage;

import com.erp.multitenancy.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Multi-tenant filesystem object storage service.
 * Enforces strict tenant path prefixing (e.g., /uploads/{tenant_id}/{category}/...)
 * to guarantee storage-level isolation across institutions.
 * Throws {@link SecurityException} whenever a file operation is attempted without
 * an active tenant context.
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final Path rootLocation;

    public FileStorageService(@Value("${app.storage.document-dir:uploads/documents}") String baseDir) {
        this.rootLocation = Paths.get(baseDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            log.warn("Could not create root storage directory: {}", e.getMessage());
        }
    }

    /**
     * Resolves the active tenant identifier, verifying that a non-empty tenant context exists.
     * Throws {@link SecurityException} if no tenant context is established.
     *
     * @return Validated tenant identifier
     * @throws SecurityException if active tenant context is missing
     */
    public String resolveActiveTenantId() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = com.edupulse.core.domain.base.TenantContext.getTenantId();
        }

        if (tenantId == null || tenantId.isBlank()) {
            log.error("Attempted file operation without active tenant context.");
            throw new SecurityException("Unauthorized file operation: Active tenant context is required for object storage isolation.");
        }

        return tenantId;
    }

    /**
     * Resolves an isolated target path for a file under the active tenant's partition.
     * Format: {rootLocation}/{tenant_id}/{category}/{fileName}
     *
     * @param category Directory category (e.g., "documents", "photos", "imports")
     * @param fileName File name
     * @return Path pointing to the tenant-isolated destination
     * @throws SecurityException if active tenant context is missing
     */
    public Path resolveTenantPath(String category, String fileName) {
        String tenantId = resolveActiveTenantId();

        Path tenantCategoryDir = rootLocation.resolve(tenantId).resolve(category);
        try {
            Files.createDirectories(tenantCategoryDir);
        } catch (IOException e) {
            log.error("Failed to create tenant storage directory [{}]: {}", tenantCategoryDir, e.getMessage());
            throw new RuntimeException("Could not create tenant storage directory: " + tenantCategoryDir, e);
        }

        return tenantCategoryDir.resolve(fileName);
    }

    /**
     * Generates a relative path string strictly prefixed with the active tenant_id.
     * Example: uploads/{tenant_id}/{category}/{fileName}
     *
     * @param category Category subfolder (e.g., "documents", "photos", "imports")
     * @param fileName Target filename
     * @return Relative tenant-prefixed storage path
     * @throws SecurityException if active tenant context is missing
     */
    public String generateTenantRelativePath(String category, String fileName) {
        String tenantId = resolveActiveTenantId();
        return "uploads/" + tenantId + "/" + category + "/" + fileName;
    }

    /**
     * Stores incoming file bytes into the tenant's isolated directory partition.
     *
     * @param category Subfolder category
     * @param fileName Target filename
     * @param inputStream Source file input stream
     * @return Stored file relative path
     * @throws SecurityException if active tenant context is missing
     */
    public String store(String category, String fileName, InputStream inputStream) throws IOException {
        Path targetPath = resolveTenantPath(category, fileName);
        Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        return generateTenantRelativePath(category, fileName);
    }

    public Path getRootLocation() {
        return rootLocation;
    }
}
