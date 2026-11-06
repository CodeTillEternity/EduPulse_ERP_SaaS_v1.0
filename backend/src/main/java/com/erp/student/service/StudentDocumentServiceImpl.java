package com.erp.student.service;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.student.dto.StudentDocumentResponseDto;
import com.erp.student.entity.DocumentType;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentDocument;
import com.erp.student.mapper.StudentMapper;
import com.erp.student.repository.StudentDocumentRepository;
import com.erp.student.repository.StudentRepository;
import com.erp.student.entity.StudentPhoto;
import com.erp.student.repository.StudentPhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentDocumentServiceImpl implements StudentDocumentService {

    private final StudentDocumentRepository documentRepository;
    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final StudentPhotoRepository studentPhotoRepository;
    private final Path storageLocation;

    @Autowired
    public StudentDocumentServiceImpl(StudentDocumentRepository documentRepository,
                                     StudentRepository studentRepository,
                                     StudentMapper studentMapper,
                                     @Autowired(required = false) StudentPhotoRepository studentPhotoRepository,
                                     @Value("${app.storage.document-dir:uploads/documents}") String uploadDir) {
        this.documentRepository = documentRepository;
        this.studentRepository = studentRepository;
        this.studentMapper = studentMapper;
        this.studentPhotoRepository = studentPhotoRepository;
        this.storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException ex) {
            throw new BusinessException("Could not initialize storage directory: " + ex.getMessage());
        }
    }

    public StudentDocumentServiceImpl(StudentDocumentRepository documentRepository,
                                      StudentRepository studentRepository,
                                      StudentMapper studentMapper,
                                      @Value("${app.storage.document-dir:uploads/documents}") String uploadDir) {
        this(documentRepository, studentRepository, studentMapper, null, uploadDir);
    }

    private static final List<String> ALLOWED_PHOTO_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    @Override
    public StudentDocumentResponseDto uploadDocument(Long studentId, DocumentType documentType, MultipartFile file) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        if (file.isEmpty()) {
            throw new BusinessException("Cannot upload empty file.");
        }

        String rawOriginalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (rawOriginalFilename.contains("..")) {
            throw new BusinessException("Filename contains invalid path sequence: " + rawOriginalFilename);
        }

        // Extract extension
        String extension = "";
        int i = rawOriginalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = rawOriginalFilename.substring(i);
        }

        String storedFileName = studentId + "_" + documentType.name() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path targetLocation = this.storageLocation.resolve(storedFileName);
        String storagePath = targetLocation.toString();

        if (documentType == DocumentType.PHOTOGRAPH) {
            // Validate image MIME type and size limit
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_PHOTO_CONTENT_TYPES.contains(contentType.toLowerCase())) {
                throw new BusinessException("Only image files (JPEG, PNG, WebP) are accepted for student photo");
            }
            if (file.getSize() > 5 * 1024 * 1024) {
                throw new BusinessException("Photo size exceeds maximum allowed size of 5MB");
            }

            byte[] photoBytes;
            try {
                photoBytes = file.getBytes();
            } catch (IOException ex) {
                throw new BusinessException("Failed to read photo data: " + ex.getMessage());
            }

            // Persist photo bytes in PostgreSQL
            if (studentPhotoRepository != null) {
                StudentPhoto photo = studentPhotoRepository.findByStudentId(studentId)
                        .orElse(new StudentPhoto());
                photo.setStudentId(studentId);
                photo.setData(photoBytes);
                photo.setContentType(contentType);
                photo.setFileSize(file.getSize());
                photo.setFileName(storedFileName);
                photo.setOriginalFileName(rawOriginalFilename);
                photo.setUpdatedAt(LocalDateTime.now());
                studentPhotoRepository.save(photo);
                storagePath = "db:student_photos/" + studentId;
            }

            // Optional local cache copy on disk
            try {
                Files.copy(new ByteArrayInputStream(photoBytes), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception ignored) {
            }
        } else {
            try {
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ex) {
                throw new BusinessException("Failed to store file " + storedFileName + ": " + ex.getMessage());
            }
        }

        // If a document of this type already exists for student, we can replace or add new version
        StudentDocument document = documentRepository.findByStudentIdAndDocumentType(studentId, documentType)
                .orElse(new StudentDocument());

        document.setStudent(student);
        document.setDocumentType(documentType);
        document.setFileName(storedFileName);
        document.setOriginalFileName(rawOriginalFilename);
        document.setFileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        document.setFileSize(file.getSize());
        document.setStoragePath(storagePath);

        StudentDocument savedDocument = documentRepository.save(document);
        return studentMapper.toDocumentDto(savedDocument);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentDocumentResponseDto> getDocumentsByStudentId(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return documentRepository.findByStudentId(studentId).stream()
                .map(studentMapper::toDocumentDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDocumentResponseDto getDocumentMetadata(Long documentId) {
        StudentDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        return studentMapper.toDocumentDto(document);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadDocumentAsResource(Long documentId) {
        StudentDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        // If photograph and stored in PostgreSQL, load directly from database
        if (document.getDocumentType() == DocumentType.PHOTOGRAPH && document.getStudent() != null && studentPhotoRepository != null) {
            var photoOpt = studentPhotoRepository.findByStudentId(document.getStudent().getId());
            if (photoOpt.isPresent() && photoOpt.get().getData() != null && photoOpt.get().getData().length > 0) {
                return new ByteArrayResource(photoOpt.get().getData());
            }
        }

        try {
            Path filePath = Paths.get(document.getStoragePath()).normalize();
            if (!Files.exists(filePath)) {
                String fileName = document.getFileName();
                String baseName = null;
                if (document.getStoragePath() != null) {
                    String cleanPath = document.getStoragePath();
                    int lastSlash = Math.max(cleanPath.lastIndexOf('/'), cleanPath.lastIndexOf('\\'));
                    if (lastSlash >= 0) {
                        baseName = cleanPath.substring(lastSlash + 1);
                    }
                }
                List<Path> candidateRoots = List.of(
                        this.storageLocation,
                        this.storageLocation.resolve("documents"),
                        this.storageLocation.resolve("students"),
                        Paths.get("uploads").toAbsolutePath().normalize(),
                        Paths.get("uploads/documents").toAbsolutePath().normalize(),
                        Paths.get("data/dev-json/uploads").toAbsolutePath().normalize(),
                        Paths.get("data/dev-json/uploads/documents").toAbsolutePath().normalize()
                );
                for (Path root : candidateRoots) {
                    if (fileName != null && Files.exists(root.resolve(fileName))) {
                        filePath = root.resolve(fileName).normalize();
                        break;
                    }
                    if (baseName != null && Files.exists(root.resolve(baseName))) {
                        filePath = root.resolve(baseName).normalize();
                        break;
                    }
                }
            }
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on server disk for document ID: " + documentId);
            }
        } catch (MalformedURLException ex) {
            throw new BusinessException("Invalid file path format: " + ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String getDocumentContentType(Long documentId) {
        StudentDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        return document.getFileType();
    }

    @Override
    public void deleteDocument(Long documentId) {
        StudentDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        if (document.getDocumentType() == DocumentType.PHOTOGRAPH && document.getStudent() != null && studentPhotoRepository != null) {
            studentPhotoRepository.deleteByStudentId(document.getStudent().getId());
        }

        try {
            Path filePath = Paths.get(document.getStoragePath());
            if (!Files.exists(filePath) && document.getFileName() != null) {
                filePath = this.storageLocation.resolve(document.getFileName());
            }
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Logged if needed, proceed with DB record deletion
        }

        documentRepository.delete(document);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Optional<StudentDocumentResponseDto> getStudentPhoto(Long studentId) {
        return documentRepository.findByStudentIdAndDocumentType(studentId, DocumentType.PHOTOGRAPH)
                .map(studentMapper::toDocumentDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadPhotoAsResource(Long studentId) {
        // 1. Check persistent PostgreSQL storage
        if (studentPhotoRepository != null) {
            var photoOpt = studentPhotoRepository.findByStudentId(studentId);
            if (photoOpt.isPresent() && photoOpt.get().getData() != null && photoOpt.get().getData().length > 0) {
                return new ByteArrayResource(photoOpt.get().getData());
            }
        }

        // 2. Check legacy filesystem-backed record in student_documents
        var legacyDocOpt = documentRepository.findByStudentIdAndDocumentType(studentId, DocumentType.PHOTOGRAPH);
        if (legacyDocOpt.isPresent()) {
            StudentDocument doc = legacyDocOpt.get();
            try {
                return loadDocumentAsResource(doc.getId());
            } catch (ResourceNotFoundException e) {
                throw new ResourceNotFoundException("Profile photo file is missing from server storage for student ID: " + studentId + ". Re-upload is required.");
            }
        }

        throw new ResourceNotFoundException("Photo not found for student id: " + studentId);
    }

    @Override
    @Transactional(readOnly = true)
    public String getPhotoContentType(Long studentId) {
        if (studentPhotoRepository != null) {
            var photoOpt = studentPhotoRepository.findByStudentId(studentId);
            if (photoOpt.isPresent() && photoOpt.get().getContentType() != null) {
                return photoOpt.get().getContentType();
            }
        }
        return documentRepository.findByStudentIdAndDocumentType(studentId, DocumentType.PHOTOGRAPH)
                .map(StudentDocument::getFileType)
                .orElse("image/jpeg");
    }

    @Override
    public void deleteStudentPhoto(Long studentId) {
        if (studentPhotoRepository != null) {
            studentPhotoRepository.deleteByStudentId(studentId);
        }
        documentRepository.findByStudentIdAndDocumentType(studentId, DocumentType.PHOTOGRAPH)
                .ifPresent(doc -> {
                    try {
                        Path filePath = Paths.get(doc.getStoragePath());
                        Files.deleteIfExists(filePath);
                    } catch (Exception ignored) {}
                    documentRepository.delete(doc);
                });
    }
}
