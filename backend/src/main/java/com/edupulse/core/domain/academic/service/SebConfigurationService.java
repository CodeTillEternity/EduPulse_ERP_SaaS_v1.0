package com.edupulse.core.domain.academic.service;

import com.edupulse.core.domain.academic.Exam;
import com.edupulse.core.domain.academic.dto.ExamSubmissionRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamSubmissionResponseDTO;

/**
 * Service managing Safe Exam Browser (SEB) configuration XML generation,
 * operating system lockdown enforcement, and cryptographic request hash validation.
 */
public interface SebConfigurationService {

    /**
     * Generates a fully locked-down SEB configuration XML string for the specified exam.
     */
    String generateSebConfigXml(Exam exam, String baseUrl);

    /**
     * Generates the .seb configuration binary payload on the fly for HTTP download.
     */
    byte[] generateSebConfigFile(Long examId, String baseUrl);

    /**
     * Computes the expected SEB request hash for a given URL and configuration key.
     */
    String computeExpectedRequestHash(String requestUrl, String sebConfigKey);

    /**
     * Validates the X-SafeExamBrowser-RequestHash header against the exam's configuration key.
     * Throws EduPulseBusinessException (403 Forbidden) if invalid or missing.
     */
    void validateSebRequestHash(String requestUrl, String sebConfigKey, String requestHashHeader);

    /**
     * Submits an examination, cryptographically verifying the locked SEB browser environment.
     */
    ExamSubmissionResponseDTO submitExam(Long examId, ExamSubmissionRequestDTO request, String requestHashHeader, String requestUrl, String clientIp);
}
