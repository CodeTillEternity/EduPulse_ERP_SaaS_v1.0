package com.erp.common.storage;

import com.erp.multitenancy.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Multi-tenant filesystem object storage service.
 * Enforces strict tenant path prefixing (e.g., uploads/{tenant_id}/{category}/...)
 * to guarantee storage-level isolation across institutions.
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
     * Resolves an isolated target path for a file under the active tenant's partition.
     * Format: {rootLocation}/{tenant_id}/{category}/{fileName}
     *
     * @param category Directory category (e.g., "students", "applicants", "photos")
     * @param fileName File name
     * @return Path pointing to the tenant-isolated destination
     */
    public Path resolveTenantPath(String category, String fileName) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = "default";
        }

        Path tenantCategoryDir = rootLocation.resolve(tenantId).resolve(category);
        try {
            Files.createDirectories(tenantCategoryDir);
        } catch (IOException e) {
            log.error("Failed to create tenant directory [{}]: {}", tenantCategoryDir, e.getMessage());
            throw new RuntimeException("Could not create tenant storage directory: " + tenantCategoryDir, e);
        }

        return tenantCategoryDir.resolve(fileName);
    }

    /**
     * Generates a relative path string prefixed with the active tenant_id.
     * Example: uploads/{tenant_id}/{category}/{fileName}
     *
     * @param category Category subfolder
     * @param fileName Target filename
     * @return Relative tenant-prefixed storage path
     */
    public String generateTenantRelativePath(String category, String fileName) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = "default";
        }
        return "uploads/" + tenantId + "/" + category + "/" + fileName;
    }

    public Path getRootLocation() {
        return rootLocation;
    }
}
