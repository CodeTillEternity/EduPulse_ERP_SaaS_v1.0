package com.erp.common.storage;

import com.erp.multitenancy.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileStorageServiceTest {

    @TempDir
    Path tempStorageDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempStorageDir.toString());
        TenantContext.clear();
        com.edupulse.core.domain.base.TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        com.edupulse.core.domain.base.TenantContext.clear();
    }

    @Test
    @DisplayName("Should prefix storage path with tenant_id when active tenant context is established")
    void resolveTenantPath_whenTenantSet_prefixesPathWithTenantId() {
        TenantContext.setTenantId("tenant-alpha");

        Path resolved = fileStorageService.resolveTenantPath("students", "profile.png");

        assertThat(resolved).isNotNull();
        assertThat(resolved.toString()).contains("tenant-alpha");
        assertThat(resolved.toString()).contains("students");
        assertThat(resolved.getFileName().toString()).isEqualTo("profile.png");
        assertThat(Files.exists(resolved.getParent())).isTrue();
    }

    @Test
    @DisplayName("Should throw SecurityException when resolving path without active tenant context")
    void resolveTenantPath_whenTenantNotSet_throwsSecurityException() {
        TenantContext.clear();
        com.edupulse.core.domain.base.TenantContext.clear();

        assertThatThrownBy(() -> fileStorageService.resolveTenantPath("applicants", "passport.pdf"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Active tenant context is required for object storage isolation");
    }

    @Test
    @DisplayName("Should format relative path with /uploads/{tenant_id}/{category}/{fileName}")
    void generateTenantRelativePath_formatsCorrectly() {
        TenantContext.setTenantId("tenant-beta");

        String relativePath = fileStorageService.generateTenantRelativePath("documents", "transcript.pdf");

        assertThat(relativePath).isEqualTo("uploads/tenant-beta/documents/transcript.pdf");
    }

    @Test
    @DisplayName("Should throw SecurityException when generating relative path without active tenant context")
    void generateTenantRelativePath_whenTenantNotSet_throwsSecurityException() {
        TenantContext.clear();
        com.edupulse.core.domain.base.TenantContext.clear();

        assertThatThrownBy(() -> fileStorageService.generateTenantRelativePath("documents", "transcript.pdf"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Active tenant context is required for object storage isolation");
    }

    @Test
    @DisplayName("Should guarantee hardware and filesystem path isolation between distinct tenant tenants")
    void storageIsolation_differentTenantsHaveDistinctPaths() {
        TenantContext.setTenantId("tenant-a");
        Path pathA = fileStorageService.resolveTenantPath("docs", "file.pdf");

        TenantContext.setTenantId("tenant-b");
        Path pathB = fileStorageService.resolveTenantPath("docs", "file.pdf");

        assertThat(pathA).isNotEqualTo(pathB);
        assertThat(pathA.getParent()).isNotEqualTo(pathB.getParent());
        assertThat(pathA.toString()).contains("tenant-a");
        assertThat(pathB.toString()).contains("tenant-b");
    }

    @Test
    @DisplayName("Should store file in tenant-partitioned directory successfully")
    void store_persistsFileInTenantPartition() throws IOException {
        TenantContext.setTenantId("tenant-files-123");

        byte[] content = "Student Record Data".getBytes(StandardCharsets.UTF_8);
        String relativePath = fileStorageService.store("documents", "student-doc.txt", new ByteArrayInputStream(content));

        assertThat(relativePath).isEqualTo("uploads/tenant-files-123/documents/student-doc.txt");

        Path resolvedPath = fileStorageService.resolveTenantPath("documents", "student-doc.txt");
        assertThat(Files.exists(resolvedPath)).isTrue();
        assertThat(Files.readString(resolvedPath)).isEqualTo("Student Record Data");
    }
}
