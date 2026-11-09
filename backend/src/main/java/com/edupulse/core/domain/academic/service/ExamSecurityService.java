package com.edupulse.core.domain.academic.service;

import com.edupulse.core.domain.academic.Exam;
import com.edupulse.core.domain.academic.dto.ExamStartRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamStartResponseDTO;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Service managing physical layer security, dynamic exam PIN verification,
 * and CIDR subnet IP whitelisting for examination proctoring.
 */
public interface ExamSecurityService {

    /**
     * Validates that the request client IP falls within the exam's allowed subnet
     * and that the provided PIN matches the dynamic exam PIN.
     * Throws EduPulseBusinessException (403 Forbidden) if either check fails.
     */
    void validateExamAccess(Exam exam, String clientIp, String providedPin);

    /**
     * Determines whether the given IP address matches the specified subnet rule
     * (supporting CIDR notation like 192.168.1.0/24, comma-separated lists, and exact IPs).
     */
    boolean isIpInSubnet(String clientIp, String allowedIpSubnet);

    /**
     * Initiates an examination session for a student, validating IP and PIN constraints,
     * and recording an ExamSubmission audit entry.
     */
    ExamStartResponseDTO startExam(Long examId, ExamStartRequestDTO request, String clientIp);

    /**
     * Intercepts and resolves the true client IP address from the HTTP request,
     * prioritizing the standard X-Forwarded-For header.
     */
    String extractClientIp(HttpServletRequest request);
}
