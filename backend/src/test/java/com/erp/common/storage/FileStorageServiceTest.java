package com.erp.common.storage;

import com.erp.multitenancy.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class FileStorageServiceTest {

    @TempDir
    Path tempStorageDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempStorageDir.toString());
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
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
    void resolveTenantPath_whenTenantNotSet_fallsBackToDefault() {
        TenantContext.clear();

        Path resolved = fileStorageService.resolveTenantPath("applicants", "passport.pdf");

        assertThat(resolved.toString()).contains("default");
        assertThat(resolved.toString()).contains("applicants");
        assertThat(Files.exists(resolved.getParent())).isTrue();
    }

    @Test
    void generateTenantRelativePath_formatsCorrectly() {
        TenantContext.setTenantId("tenant-beta");

        String relativePath = fileStorageService.generateTenantRelativePath("documents", "transcript.pdf");

        assertThat(relativePath).isEqualTo("uploads/tenant-beta/documents/transcript.pdf");
    }

    @Test
    void storageIsolation_differentTenantsHaveDistinctPaths() {
        TenantContext.setTenantId("tenant-a");
        Path pathA = fileStorageService.resolveTenantPath("docs", "file.pdf");

        TenantContext.setTenantId("tenant-b");
        Path pathB = fileStorageService.resolveTenantPath("docs", "file.pdf");

        assertThat(pathA).isNotEqualTo(pathB);
        assertThat(pathA.getParent()).isNotEqualTo(pathB.getParent());
    }
}
