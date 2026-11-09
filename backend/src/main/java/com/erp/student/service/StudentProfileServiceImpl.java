package com.erp.student.service;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.common.storage.StorageService;
import com.erp.multitenancy.TenantContext;
import com.erp.student.entity.DocumentType;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentDocument;
import com.erp.student.entity.StudentPhoto;
import com.erp.student.repository.StudentDocumentRepository;
import com.erp.student.repository.StudentPhotoRepository;
import com.erp.student.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Enterprise implementation of StudentProfileService utilizing AWS S3 Object Storage.
 * Stores generated CDN URLs in PostgreSQL and completely eliminates ephemeral local disk dependency.
 */
@Service
@Transactional
public class StudentProfileServiceImpl implements StudentProfileService {

    private static final Logger log = LoggerFactory.getLogger(StudentProfileServiceImpl.class);

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private final StorageService storageService;
    private final StudentRepository studentRepository;
    private final StudentPhotoRepository studentPhotoRepository;
    private final StudentDocumentRepository studentDocumentRepository;

    @Autowired
    public StudentProfileServiceImpl(StorageService storageService,
                                     StudentRepository studentRepository,
                                     StudentPhotoRepository studentPhotoRepository,
                                     @Autowired(required = false) StudentDocumentRepository studentDocumentRepository) {
        this.storageService = storageService;
        this.studentRepository = studentRepository;
        this.studentPhotoRepository = studentPhotoRepository;
        this.studentDocumentRepository = studentDocumentRepository;
    }

    @Override
    public String uploadProfilePhoto(Long studentId, InputStream inputStream, String contentType, long contentLength, String originalFilename) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException("Only image files (JPEG, PNG, WebP) are accepted for student photo");
        }
        if (contentLength > 5 * 1024 * 1024) {
            throw new BusinessException("Photo size exceeds maximum allowed size of 5MB");
        }

        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = "default";
        }

        String extension = ".jpg";
        if (originalFilename != null && originalFilename.lastIndexOf('.') > 0) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String s3Key = "tenants/" + tenantId + "/students/" + studentId + "/photo_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        String cdnUrl = storageService.uploadFile(s3Key, inputStream, contentType, contentLength);

        // 1. Update Student entity with S3 CDN URL
        student.setPhotoUrl(cdnUrl);
        studentRepository.save(student);

        // 2. Update StudentPhoto in PostgreSQL
        StudentPhoto photo = studentPhotoRepository.findByStudentId(studentId)
                .orElse(new StudentPhoto());
        photo.setStudentId(studentId);
        photo.setPhotoUrl(cdnUrl);
        photo.setContentType(contentType);
        photo.setFileSize(contentLength);
        photo.setFileName(s3Key);
        photo.setOriginalFileName(originalFilename != null ? originalFilename : "photo" + extension);
        photo.setData(new byte[0]); // Zero out disk/byte blobs; CDN URL is source of truth
        photo.setUpdatedAt(LocalDateTime.now());
        studentPhotoRepository.save(photo);

        // 3. Update StudentDocument record if present
        if (studentDocumentRepository != null) {
            StudentDocument document = studentDocumentRepository.findByStudentIdAndDocumentType(studentId, DocumentType.PHOTOGRAPH)
                    .orElse(new StudentDocument());
            document.setStudent(student);
            document.setDocumentType(DocumentType.PHOTOGRAPH);
            document.setFileName(s3Key);
            document.setOriginalFileName(originalFilename != null ? originalFilename : "photo" + extension);
            document.setFileType(contentType);
            document.setFileSize(contentLength);
            document.setStoragePath(cdnUrl);
            studentDocumentRepository.save(document);
        }

        log.info("Uploaded profile photo to AWS S3 for student ID [{}], CDN URL: [{}]", studentId, cdnUrl);
        return cdnUrl;
    }

    @Override
    public String uploadProfilePhoto(Long studentId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Photo file cannot be empty");
        }
        try {
            return uploadProfilePhoto(
                    studentId,
                    file.getInputStream(),
                    file.getContentType(),
                    file.getSize(),
                    file.getOriginalFilename()
            );
        } catch (IOException e) {
            log.error("Failed to read input stream for student photo upload: {}", e.getMessage(), e);
            throw new BusinessException("Failed to read uploaded photo file: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String getProfilePhotoUrl(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        if (student.getPhotoUrl() != null && !student.getPhotoUrl().isBlank()) {
            return student.getPhotoUrl();
        }

        return studentPhotoRepository.findByStudentId(studentId)
                .map(StudentPhoto::getPhotoUrl)
                .orElse(null);
    }

    @Override
    public void deleteProfilePhoto(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        student.setPhotoUrl(null);
        studentRepository.save(student);

        studentPhotoRepository.findByStudentId(studentId).ifPresent(photo -> {
            if (photo.getFileName() != null && !photo.getFileName().isBlank()) {
                storageService.deleteFile(photo.getFileName());
            }
            studentPhotoRepository.delete(photo);
        });

        if (studentDocumentRepository != null) {
            studentDocumentRepository.findByStudentIdAndDocumentType(studentId, DocumentType.PHOTOGRAPH)
                    .ifPresent(studentDocumentRepository::delete);
        }

        log.info("Deleted profile photo for student ID [{}] from AWS S3 and PostgreSQL", studentId);
    }
}
