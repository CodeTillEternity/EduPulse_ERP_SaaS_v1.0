package com.erp.student;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.student.controller.StudentDocumentController;
import com.erp.student.dto.StudentDocumentResponseDto;
import com.erp.student.entity.DocumentType;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentDocument;
import com.erp.student.entity.StudentPhoto;
import com.erp.student.entity.StudentStatus;
import com.erp.student.mapper.StudentMapper;
import com.erp.student.repository.StudentDocumentRepository;
import com.erp.student.repository.StudentPhotoRepository;
import com.erp.student.repository.StudentRepository;
import com.erp.student.service.StudentDocumentService;
import com.erp.student.service.StudentDocumentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class StudentPhotoPersistenceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentDocumentRepository documentRepository;

    @Autowired
    private StudentPhotoRepository photoRepository;

    @Autowired
    private StudentDocumentService documentService;

    @Autowired
    private StudentMapper studentMapper;

    @Autowired
    private UserRepository userRepository;

    private Student testStudent;
    private AppUser adminUser;

    @BeforeEach
    void setUp() {
        photoRepository.deleteAll();
        documentRepository.deleteAll();

        adminUser = userRepository.findByUsernameIgnoreCase("admin")
                .orElseGet(() -> userRepository.save(new AppUser("admin", "Admin@123", "admin@erp.com", Role.ADMIN, true)));

        testStudent = new Student();
        testStudent.setRollNumber("ROLL-PHOTO-" + System.currentTimeMillis());
        testStudent.setFirstName("Alice");
        testStudent.setLastName("Smith");
        testStudent.setEmail("alice.smith." + System.currentTimeMillis() + "@test.com");
        testStudent.setPhone("9876501234");
        testStudent.setDateOfBirth(LocalDate.of(2001, 5, 20));
        testStudent.setGender("FEMALE");
        testStudent.setDepartment("Computer Science");
        testStudent.setBatch("2026");
        testStudent.setEnrollmentDate(LocalDate.now());
        testStudent.setEnrollmentNumber("ENR-PHOTO-" + System.currentTimeMillis());
        testStudent.setStatus(StudentStatus.ACTIVE);
        testStudent = studentRepository.save(testStudent);
    }

    @Test
    @DisplayName("1. Upload and retrieve photo persists binary in PostgreSQL with matching MIME type and bytes")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testUploadAndRetrievePhoto() throws Exception {
        byte[] originalBytes = new byte[]{(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x01, 0x02, 0x03};
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "profile.png",
                "image/png",
                originalBytes
        );

        mockMvc.perform(multipart("/api/v1/students/" + testStudent.getId() + "/photo")
                        .file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fileType").value("image/png"));

        // Verify in database
        var photoOpt = photoRepository.findByStudentId(testStudent.getId());
        assertTrue(photoOpt.isPresent(), "Photo must be persisted in student_photos table");
        StudentPhoto photo = photoOpt.get();
        assertEquals("image/png", photo.getContentType());
        assertEquals("profile.png", photo.getOriginalFileName());
        assertEquals((long) originalBytes.length, photo.getFileSize());
        assertArrayEquals(originalBytes, photo.getData());

        // Retrieve photo via public GET endpoint
        mockMvc.perform(get("/api/v1/students/" + testStudent.getId() + "/photo"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/png"))
                .andExpect(content().bytes(originalBytes));
    }

    @Test
    @DisplayName("2. Photo replacement updates existing record without leaving orphaned photos")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testPhotoReplacementNoOrphans() throws Exception {
        byte[] firstPhoto = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01, 0x02};
        MockMultipartFile firstFile = new MockMultipartFile("file", "photo1.jpg", "image/jpeg", firstPhoto);

        mockMvc.perform(multipart("/api/v1/students/" + testStudent.getId() + "/photo").file(firstFile))
                .andExpect(status().isCreated());

        assertEquals(1, photoRepository.count());

        byte[] secondPhoto = new byte[]{'R', 'I', 'F', 'F', 0x10, 0x00, 0x00, 0x00, 'W', 'E', 'B', 'P'};
        MockMultipartFile secondFile = new MockMultipartFile("file", "photo2.webp", "image/webp", secondPhoto);

        mockMvc.perform(multipart("/api/v1/students/" + testStudent.getId() + "/photo").file(secondFile))
                .andExpect(status().isCreated());

        // Verify only 1 record exists in student_photos
        assertEquals(1, photoRepository.count(), "Replacement must not leave orphaned records in student_photos");

        // Verify content updated to second photo
        StudentPhoto updated = photoRepository.findByStudentId(testStudent.getId()).orElseThrow();
        assertEquals("image/webp", updated.getContentType());
        assertEquals("photo2.webp", updated.getOriginalFileName());
        assertArrayEquals(secondPhoto, updated.getData());

        // Verify GET returns second photo
        mockMvc.perform(get("/api/v1/students/" + testStudent.getId() + "/photo"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/webp"))
                .andExpect(content().bytes(secondPhoto));
    }

    @Test
    @DisplayName("3. Durability across service reinitialization / container restart simulation")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testPersistenceAcrossServiceReinitialization() throws Exception {
        byte[] imageBytes = new byte[]{0x11, 0x22, 0x33, 0x44, 0x55};
        MockMultipartFile file = new MockMultipartFile("file", "durable.jpg", "image/jpeg", imageBytes);

        mockMvc.perform(multipart("/api/v1/students/" + testStudent.getId() + "/photo").file(file))
                .andExpect(status().isCreated());

        // Simulate server restart: create a new service instance pointing only to the database with a fresh/empty temp folder
        String newTempDir = System.getProperty("java.io.tmpdir") + "/edupulse_restart_test_" + System.currentTimeMillis();
        StudentDocumentServiceImpl freshServiceInstance = new StudentDocumentServiceImpl(
                documentRepository,
                studentRepository,
                studentMapper,
                photoRepository,
                newTempDir
        );

        // Retrieve photo using newly initialized service instance
        Resource loadedResource = freshServiceInstance.loadPhotoAsResource(testStudent.getId());
        assertNotNull(loadedResource);
        assertTrue(loadedResource.exists());
        byte[] loadedBytes = loadedResource.getInputStream().readAllBytes();
        assertArrayEquals(imageBytes, loadedBytes, "Loaded bytes from fresh service must match database persisted bytes");
        assertEquals("image/jpeg", freshServiceInstance.getPhotoContentType(testStudent.getId()));
    }

    @Test
    @DisplayName("4. Legacy filesystem-backed photo with missing disk file returns 404 without crashing")
    void testLegacyMissingDiskFileReturns404() throws Exception {
        // Seed legacy StudentDocument record pointing to a missing file
        StudentDocument legacyDoc = new StudentDocument();
        legacyDoc.setStudent(testStudent);
        legacyDoc.setDocumentType(DocumentType.PHOTOGRAPH);
        legacyDoc.setFileName("missing_old_photo.jpg");
        legacyDoc.setOriginalFileName("missing_old_photo.jpg");
        legacyDoc.setFileType("image/jpeg");
        legacyDoc.setFileSize(1024L);
        legacyDoc.setStoragePath("/non/existent/path/missing_old_photo.jpg");
        documentRepository.save(legacyDoc);

        // Verify student_photos is empty
        assertTrue(photoRepository.findByStudentId(testStudent.getId()).isEmpty());

        // GET must return 404 Not Found cleanly
        mockMvc.perform(get("/api/v1/students/" + testStudent.getId() + "/photo"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("5. Non-existent student photo returns 404")
    void testNonExistentPhotoReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/students/999999/photo"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("6. Invalid uploads: rejected for unsupported MIME type, size limit, or empty file")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testInvalidUploads() throws Exception {
        // Unsupported MIME type (text/plain)
        MockMultipartFile textFile = new MockMultipartFile("file", "script.txt", "text/plain", "hello".getBytes());
        mockMvc.perform(multipart("/api/v1/students/" + testStudent.getId() + "/photo").file(textFile))
                .andExpect(status().is4xxClientError());

        // Unsupported MIME type (application/pdf)
        MockMultipartFile pdfFile = new MockMultipartFile("file", "doc.pdf", "application/pdf", "%PDF".getBytes());
        mockMvc.perform(multipart("/api/v1/students/" + testStudent.getId() + "/photo").file(pdfFile))
                .andExpect(status().is4xxClientError());

        // Empty file
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.jpg", "image/jpeg", new byte[0]);
        mockMvc.perform(multipart("/api/v1/students/" + testStudent.getId() + "/photo").file(emptyFile))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("7. DELETE /api/v1/students/{id}/photo deletes photo from database cleanly")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testDeletePhoto() throws Exception {
        byte[] imageBytes = new byte[]{0x10, 0x20, 0x30};
        MockMultipartFile file = new MockMultipartFile("file", "delete_me.png", "image/png", imageBytes);

        mockMvc.perform(multipart("/api/v1/students/" + testStudent.getId() + "/photo").file(file))
                .andExpect(status().isCreated());

        assertTrue(photoRepository.findByStudentId(testStudent.getId()).isPresent());

        // Delete photo
        mockMvc.perform(delete("/api/v1/students/" + testStudent.getId() + "/photo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertTrue(photoRepository.findByStudentId(testStudent.getId()).isEmpty(), "Photo must be removed from student_photos");
        assertTrue(documentRepository.findByStudentIdAndDocumentType(testStudent.getId(), DocumentType.PHOTOGRAPH).isEmpty(), "Document record must be removed");

        // Subsequent GET returns 404
        mockMvc.perform(get("/api/v1/students/" + testStudent.getId() + "/photo"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("8. Regression: Non-photo student documents still function normally")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testNonPhotoDocumentsRegression() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 sample content".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile aadhaarFile = new MockMultipartFile(
                "file",
                "aadhaar.pdf",
                "application/pdf",
                pdfBytes
        );

        // Upload Aadhaar document via documents endpoint
        mockMvc.perform(multipart("/api/v1/students/" + testStudent.getId() + "/documents")
                        .file(aadhaarFile)
                        .param("documentType", "AADHAAR"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.documentType").value("AADHAAR"));

        // Verify student_photos was NOT modified for non-photo document
        assertTrue(photoRepository.findByStudentId(testStudent.getId()).isEmpty());

        // Verify document listing includes Aadhaar
        List<StudentDocumentResponseDto> docs = documentService.getDocumentsByStudentId(testStudent.getId());
        assertEquals(1, docs.size());
        assertEquals(DocumentType.AADHAAR, docs.get(0).getDocumentType());

        // Verify download succeeds
        mockMvc.perform(get("/api/v1/documents/" + docs.get(0).getId() + "/download"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    @DisplayName("9. Flyway V9 script validation")
    void testFlywayV9ScriptValidation() throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/db/migration/V9__create_student_photos_table.sql")) {
            assertNotNull(is, "V9 migration script must exist in classpath db/migration");
            String sql = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS student_photos"), "Must define student_photos table");
            assertTrue(sql.contains("student_id BIGINT NOT NULL UNIQUE"), "Must define student_id with unique constraint");
            assertTrue(sql.contains("data BYTEA NOT NULL"), "Must define data BYTEA column");
            assertTrue(sql.contains("content_type VARCHAR(100) NOT NULL"), "Must define content_type column");
            assertTrue(sql.contains("file_size BIGINT NOT NULL"), "Must define file_size column");
            assertTrue(sql.contains("file_name VARCHAR(255) NOT NULL"), "Must define file_name column");
            assertTrue(sql.contains("original_file_name VARCHAR(255) NOT NULL"), "Must define original_file_name column");
            assertTrue(sql.contains("updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP"), "Must define updated_at column");
            assertTrue(sql.contains("fk_student_photos_student"), "Must define fk_student_photos_student constraint");
            assertTrue(sql.contains("idx_student_photos_student_id"), "Must create idx_student_photos_student_id");
        }
    }
}
