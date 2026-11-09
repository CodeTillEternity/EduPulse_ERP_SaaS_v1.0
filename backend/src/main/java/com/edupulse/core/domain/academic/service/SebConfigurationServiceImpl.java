package com.edupulse.core.domain.academic.service;

import com.edupulse.core.domain.academic.Exam;
import com.edupulse.core.domain.academic.ExamQuestion;
import com.edupulse.core.domain.academic.ExamSubmission;
import com.edupulse.core.domain.academic.dto.ExamAnswerDTO;
import com.edupulse.core.domain.academic.dto.ExamSubmissionRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamSubmissionResponseDTO;
import com.edupulse.core.domain.academic.repository.ExamQuestionRepository;
import com.edupulse.core.domain.academic.repository.ExamRepository;
import com.edupulse.core.domain.academic.repository.ExamSubmissionRepository;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.erp.common.exception.EduPulseBusinessException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service("coreSebConfigurationService")
@Transactional
public class SebConfigurationServiceImpl implements SebConfigurationService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamSubmissionRepository examSubmissionRepository;
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper;

    public SebConfigurationServiceImpl(
            @Qualifier("coreExamRepository") ExamRepository examRepository,
            @Qualifier("coreExamQuestionRepository") ExamQuestionRepository examQuestionRepository,
            @Qualifier("coreExamSubmissionRepository") ExamSubmissionRepository examSubmissionRepository,
            @Qualifier("coreStudentRepository") StudentRepository studentRepository,
            ObjectMapper objectMapper) {
        this.examRepository = examRepository;
        this.examQuestionRepository = examQuestionRepository;
        this.examSubmissionRepository = examSubmissionRepository;
        this.studentRepository = studentRepository;
        this.objectMapper = objectMapper;
    }

    private String resolveTenantId() {
        String tenantId = TenantContext.getTenantId();
        return (tenantId != null && !tenantId.isBlank()) ? tenantId : "default";
    }

    @Override
    public String generateSebConfigXml(Exam exam, String baseUrl) {
        if (exam == null) {
            throw new EduPulseBusinessException("Exam cannot be null for SEB configuration", HttpStatus.NOT_FOUND);
        }

        String effectiveBaseUrl = (baseUrl != null && !baseUrl.isBlank()) ? baseUrl.replaceAll("/+$", "") : "https://edupulse.app";
        String startUrl = effectiveBaseUrl + "/api/exams/" + exam.getId() + "/start";
        String configKey = exam.getSebConfigKey();
        if (configKey == null || configKey.isBlank()) {
            configKey = UUID.randomUUID().toString().replace("-", "");
            exam.setSebConfigKey(configKey);
            examRepository.save(exam);
        }

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
        xml.append("<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n");
        xml.append("<plist version=\"1.0\">\n");
        xml.append("<dict>\n");
        xml.append("    <key>originatorVersion</key>\n");
        xml.append("    <string>SEB_Win_3.3</string>\n");
        xml.append("    <key>startURL</key>\n");
        xml.append("    <string>").append(escapeXml(startUrl)).append("</string>\n");
        xml.append("    <key>sebConfigKey</key>\n");
        xml.append("    <string>").append(escapeXml(configKey)).append("</string>\n");
        xml.append("    <!-- Operating System Lockdown: Background Applications Restricted -->\n");
        xml.append("    <key>allowSwitchToApplications</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>allowQuit</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>allowPreferencesWindow</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>killExplorers</key>\n");
        xml.append("    <true/>\n");
        xml.append("    <!-- Multi-Monitor Restriction: Dual Monitors Disabled -->\n");
        xml.append("    <key>enableMultipleMonitors</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>allowDualMonitors</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>detectVisualSeparation</key>\n");
        xml.append("    <true/>\n");
        xml.append("    <!-- System Clipboard & Copy-Paste Disabled -->\n");
        xml.append("    <key>allowClipboard</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>clearClipboardOnCheckin</key>\n");
        xml.append("    <true/>\n");
        xml.append("    <key>clearClipboardOnCheckout</key>\n");
        xml.append("    <true/>\n");
        xml.append("    <!-- Desktop Environment Lockdown -->\n");
        xml.append("    <key>showTaskBar</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>showMenuBar</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>showSideMenu</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>enableRightMouse</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>allowPrintScreen</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>enableBrowsingBackForward</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>allowDownAndUploads</key>\n");
        xml.append("    <false/>\n");
        xml.append("    <key>whitelistURLFilter</key>\n");
        xml.append("    <true/>\n");
        xml.append("</dict>\n");
        xml.append("</plist>\n");

        return xml.toString();
    }

    @Override
    public byte[] generateSebConfigFile(Long examId, String baseUrl) {
        String tenantId = resolveTenantId();
        Exam exam = examRepository.findByIdAndTenantId(examId, tenantId)
                .orElseThrow(() -> new EduPulseBusinessException("Exam not found with ID: " + examId, HttpStatus.NOT_FOUND));

        String xml = generateSebConfigXml(exam, baseUrl);
        return xml.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public String computeExpectedRequestHash(String requestUrl, String sebConfigKey) {
        if (requestUrl == null || sebConfigKey == null) {
            return "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((requestUrl + sebConfigKey).getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 digest unavailable", e);
        }
    }

    private String computeHmacSha256(String requestUrl, String sebConfigKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(sebConfigKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hmac = mac.doFinal(requestUrl.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hmac);
        } catch (Exception e) {
            return "";
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    @Override
    public void validateSebRequestHash(String requestUrl, String sebConfigKey, String requestHashHeader) {
        if (requestHashHeader == null || requestHashHeader.isBlank()) {
            log.warn("SEB OS-Lockdown Violation: Missing X-SafeExamBrowser-RequestHash HTTP header for URL [{}]", requestUrl);
            throw new EduPulseBusinessException(
                    "Safe Exam Browser validation failed: Missing X-SafeExamBrowser-RequestHash HTTP header. Examination must be submitted from within the locked Safe Exam Browser environment.",
                    HttpStatus.FORBIDDEN);
        }

        if (sebConfigKey == null || sebConfigKey.isBlank()) {
            throw new EduPulseBusinessException("Exam does not have a configured SEB security key", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String trimmedHeader = requestHashHeader.trim();
        String expectedHash = computeExpectedRequestHash(requestUrl, sebConfigKey);
        String expectedHmac = computeHmacSha256(requestUrl, sebConfigKey);

        boolean matches = trimmedHeader.equalsIgnoreCase(expectedHash) || trimmedHeader.equalsIgnoreCase(expectedHmac);

        // Also check if client submitted relative URI
        if (!matches && requestUrl.contains("://")) {
            String relativePath = requestUrl.substring(requestUrl.indexOf("/", requestUrl.indexOf("://") + 3));
            String relExpectedHash = computeExpectedRequestHash(relativePath, sebConfigKey);
            String relExpectedHmac = computeHmacSha256(relativePath, sebConfigKey);
            matches = trimmedHeader.equalsIgnoreCase(relExpectedHash) || trimmedHeader.equalsIgnoreCase(relExpectedHmac);
        }

        if (!matches) {
            log.warn("SEB OS-Lockdown Violation: Cryptographic signature mismatch. Provided [{}], Expected [{}] for URL [{}]",
                    requestHashHeader, expectedHash, requestUrl);
            throw new EduPulseBusinessException(
                    "Safe Exam Browser validation failed: Invalid X-SafeExamBrowser-RequestHash cryptographic signature. Tampering detected or request originated outside locked browser.",
                    HttpStatus.FORBIDDEN);
        }
    }

    @Override
    public ExamSubmissionResponseDTO submitExam(Long examId, ExamSubmissionRequestDTO request, String requestHashHeader, String requestUrl, String clientIp) {
        String tenantId = resolveTenantId();
        Exam exam = examRepository.findByIdAndTenantId(examId, tenantId)
                .orElseThrow(() -> new EduPulseBusinessException("Exam not found with ID: " + examId, HttpStatus.NOT_FOUND));

        // 1. Validate Safe Exam Browser cryptographic request hash header
        validateSebRequestHash(requestUrl, exam.getSebConfigKey(), requestHashHeader);

        // 2. Identify authenticated student
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Student student = resolveCurrentStudent(auth, tenantId);

        // 3. Retrieve or create submission record
        ExamSubmission submission = examSubmissionRepository.findByExamIdAndStudentIdAndTenantId(examId, student.getId(), tenantId)
                .orElseGet(() -> {
                    ExamSubmission sub = new ExamSubmission();
                    sub.setExam(exam);
                    sub.setStudent(student);
                    sub.setStartedAt(LocalDateTime.now());
                    sub.setTenantId(tenantId);
                    return sub;
                });

        if ("SUBMITTED".equalsIgnoreCase(submission.getStatus()) || "EVALUATED".equalsIgnoreCase(submission.getStatus())) {
            throw new EduPulseBusinessException("Exam has already been submitted", HttpStatus.FORBIDDEN);
        }

        // 4. Automatic evaluation of question answers
        List<ExamQuestion> questions = examQuestionRepository.findByExamIdAndTenantIdOrderByOrderIndexAsc(examId, tenantId);
        Map<Long, ExamQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(ExamQuestion::getId, q -> q));

        BigDecimal totalScore = BigDecimal.ZERO;
        if (request != null && request.getAnswers() != null) {
            for (ExamAnswerDTO answer : request.getAnswers()) {
                if (answer.getQuestionId() != null && questionMap.containsKey(answer.getQuestionId())) {
                    ExamQuestion q = questionMap.get(answer.getQuestionId());
                    if (q.getCorrectAnswer() != null && answer.getSelectedAnswer() != null) {
                        if (q.getCorrectAnswer().trim().equalsIgnoreCase(answer.getSelectedAnswer().trim())) {
                            totalScore = totalScore.add(q.getMarks() != null ? q.getMarks() : BigDecimal.ZERO);
                        }
                    }
                }
            }
        }

        // 5. Serialize answers
        String answersJson = null;
        try {
            answersJson = objectMapper.writeValueAsString(request != null ? request.getAnswers() : List.of());
        } catch (Exception e) {
            log.error("Failed to serialize submission answers", e);
        }

        submission.setScore(totalScore);
        submission.setStatus("SUBMITTED");
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setAnswersJson(answersJson);
        submission.setClientIp(clientIp);
        submission.setSebRequestHash(requestHashHeader);

        ExamSubmission savedSubmission = examSubmissionRepository.save(submission);

        BigDecimal passingMarks = exam.getPassingMarks() != null ? exam.getPassingMarks() : BigDecimal.ZERO;
        boolean passed = totalScore.compareTo(passingMarks) >= 0;

        String studentFullName = student.getFirstName() + " " + student.getLastName();
        log.info("Student [{}] submitted Exam [{}] successfully under SEB verification. Score: [{}/{}], Passed: [{}]",
                student.getId(), examId, totalScore, exam.getMaxMarks(), passed);

        return ExamSubmissionResponseDTO.builder()
                .submissionId(savedSubmission.getId())
                .examId(exam.getId())
                .studentName(studentFullName)
                .score(totalScore)
                .maxMarks(exam.getMaxMarks())
                .passingMarks(passingMarks)
                .passed(passed)
                .status(savedSubmission.getStatus())
                .submittedAt(savedSubmission.getSubmittedAt())
                .sebValidated(true)
                .build();
    }

    private Student resolveCurrentStudent(Authentication auth, String tenantId) {
        if (auth == null || auth.getName() == null) {
            throw new EduPulseBusinessException("Unauthenticated request", HttpStatus.UNAUTHORIZED);
        }
        String principal = auth.getName();
        return studentRepository.findByEmailAndTenantId(principal, tenantId)
                .or(() -> studentRepository.findByEnrollmentNumberAndTenantId(principal, tenantId))
                .orElseThrow(() -> new EduPulseBusinessException("Student profile not found for principal: " + principal, HttpStatus.NOT_FOUND));
    }

    private String escapeXml(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
