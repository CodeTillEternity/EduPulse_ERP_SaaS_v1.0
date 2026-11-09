package com.erp.student.service;

import com.erp.common.exception.BusinessException;
import com.erp.common.storage.StorageService;
import com.erp.multitenancy.TenantContext;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentPhoto;
import com.erp.student.repository.StudentDocumentRepository;
import com.erp.student.repository.StudentPhotoRepository;
import com.erp.student.repository.StudentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class StudentProfileServiceTest {

    private StorageService storageService;
    private StudentRepository studentRepository;
    private StudentPhotoRepository studentPhotoRepository;
    private StudentDocumentRepository studentDocumentRepository;
    private StudentProfileServiceImpl profileService;

    @BeforeEach
    void setUp() {
        storageService = mock(StorageService.class);
        studentRepository = mock(StudentRepository.class);
        studentPhotoRepository = mock(StudentPhotoRepository.class);
        studentDocumentRepository = mock(StudentDocumentRepository.class);

        profileService = new StudentProfileServiceImpl(
                storageService,
                studentRepository,
                studentPhotoRepository,
                studentDocumentRepository
        );

        TenantContext.setTenantId("test_institution");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("Should stream profile photo directly to S3 and persist CDN URL in PostgreSQL")
    void testUploadProfilePhotoSuccess() {
        Long studentId = 42L;
        Student student = new Student();
        student.setId(studentId);
        student.setRollNumber("ROLL-42");

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentPhotoRepository.findByStudentId(studentId)).thenReturn(Optional.empty());

        String expectedCdnUrl = "https://edupulse-saas-storage.s3.ap-south-1.amazonaws.com/tenants/test_institution/students/42/photo_abc123.jpg";
        when(storageService.uploadFile(anyString(), any(InputStream.class), eq("image/jpeg"), eq(1024L)))
                .thenReturn(expectedCdnUrl);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.jpg",
                "image/jpeg",
                new byte[1024]
        );

        String resultUrl = profileService.uploadProfilePhoto(studentId, file);

        assertEquals(expectedCdnUrl, resultUrl);
        assertEquals(expectedCdnUrl, student.getPhotoUrl());

        // Verify Student entity was updated with CDN URL
        verify(studentRepository, times(1)).save(student);

        // Verify StudentPhoto in PostgreSQL was updated with CDN URL and zeroed byte array
        ArgumentCaptor<StudentPhoto> photoCaptor = ArgumentCaptor.forClass(StudentPhoto.class);
        verify(studentPhotoRepository, times(1)).save(photoCaptor.capture());

        StudentPhoto savedPhoto = photoCaptor.getValue();
        assertEquals(studentId, savedPhoto.getStudentId());
        assertEquals(expectedCdnUrl, savedPhoto.getPhotoUrl());
        assertEquals("image/jpeg", savedPhoto.getContentType());
        assertEquals(1024L, savedPhoto.getFileSize());
        assertNotNull(savedPhoto.getData());
        assertEquals(0, savedPhoto.getData().length);
    }

    @Test
    @DisplayName("Should retrieve profile photo URL from Student entity or StudentPhoto")
    void testGetProfilePhotoUrl() {
        Long studentId = 42L;
        Student student = new Student();
        student.setId(studentId);
        student.setPhotoUrl("https://s3.amazonaws.com/test-bucket/photo.png");

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        String url = profileService.getProfilePhotoUrl(studentId);
        assertEquals("https://s3.amazonaws.com/test-bucket/photo.png", url);
    }

    @Test
    @DisplayName("Should delete profile photo from S3 and cleanup database")
    void testDeleteProfilePhoto() {
        Long studentId = 42L;
        Student student = new Student();
        student.setId(studentId);
        student.setPhotoUrl("https://s3.amazonaws.com/test-bucket/photo.png");

        StudentPhoto photo = new StudentPhoto();
        photo.setStudentId(studentId);
        photo.setFileName("tenants/test/students/42/photo.png");

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentPhotoRepository.findByStudentId(studentId)).thenReturn(Optional.of(photo));

        profileService.deleteProfilePhoto(studentId);

        assertNull(student.getPhotoUrl());
        verify(studentRepository, times(1)).save(student);
        verify(storageService, times(1)).deleteFile("tenants/test/students/42/photo.png");
        verify(studentPhotoRepository, times(1)).delete(photo);
    }

    @Test
    @DisplayName("Should reject invalid image MIME types")
    void testRejectInvalidMimeType() {
        Long studentId = 42L;
        Student student = new Student();
        student.setId(studentId);
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                "PDF data".getBytes(StandardCharsets.UTF_8)
        );

        assertThrows(BusinessException.class, () -> profileService.uploadProfilePhoto(studentId, pdfFile));
        verifyNoInteractions(storageService);
    }
}
