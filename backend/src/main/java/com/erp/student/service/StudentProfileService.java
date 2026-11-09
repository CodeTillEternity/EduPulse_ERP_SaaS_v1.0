package com.erp.student.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * Service managing student profile photographs and avatar assets.
 * Backed by AWS S3 cloud object storage, eliminating local ephemeral filesystem reliance.
 */
public interface StudentProfileService {

    /**
     * Streams profile photo directly to cloud storage and persists the CDN URL in PostgreSQL.
     *
     * @param studentId        ID of the student
     * @param inputStream      binary stream of image bytes
     * @param contentType      MIME type (e.g. image/jpeg, image/png)
     * @param contentLength    size in bytes
     * @param originalFilename client original filename
     * @return direct cloud storage / CDN URL
     */
    String uploadProfilePhoto(Long studentId, InputStream inputStream, String contentType, long contentLength, String originalFilename);

    /**
     * Convenience method to upload multipart photo payload.
     *
     * @param studentId ID of the student
     * @param file      multipart file from HTTP request
     * @return direct cloud storage / CDN URL
     */
    String uploadProfilePhoto(Long studentId, MultipartFile file);

    /**
     * Resolves the profile photo URL for a student.
     *
     * @param studentId ID of the student
     * @return CDN URL or null if no photo uploaded
     */
    String getProfilePhotoUrl(Long studentId);

    /**
     * Deletes student photo from S3 and cleans database references.
     *
     * @param studentId ID of the student
     */
    void deleteProfilePhoto(Long studentId);
}
