package com.edupulse.core.domain.academic.service;

import com.edupulse.core.domain.academic.CourseOffering;
import com.edupulse.core.domain.academic.Exam;
import com.edupulse.core.domain.academic.ExamQuestion;
import com.edupulse.core.domain.academic.ExamStatus;
import com.edupulse.core.domain.academic.ExamSubmission;
import com.edupulse.core.domain.academic.dto.ExamQuestionDTO;
import com.edupulse.core.domain.academic.dto.ExamStartRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamStartResponseDTO;
import com.edupulse.core.domain.academic.repository.CourseOfferingRepository;
import com.edupulse.core.domain.academic.repository.ExamQuestionRepository;
import com.edupulse.core.domain.academic.repository.ExamRepository;
import com.edupulse.core.domain.academic.repository.ExamSubmissionRepository;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.erp.common.exception.EduPulseBusinessException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service("coreExamSecurityService")
@Transactional
public class ExamSecurityServiceImpl implements ExamSecurityService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamSubmissionRepository examSubmissionRepository;
    private final StudentRepository studentRepository;
    private final CourseOfferingRepository courseOfferingRepository;

    public ExamSecurityServiceImpl(
            @Qualifier("coreExamRepository") ExamRepository examRepository,
            @Qualifier("coreExamQuestionRepository") ExamQuestionRepository examQuestionRepository,
            @Qualifier("coreExamSubmissionRepository") ExamSubmissionRepository examSubmissionRepository,
            @Qualifier("coreStudentRepository") StudentRepository studentRepository,
            @Qualifier("coreCourseOfferingRepository") CourseOfferingRepository courseOfferingRepository) {
        this.examRepository = examRepository;
        this.examQuestionRepository = examQuestionRepository;
        this.examSubmissionRepository = examSubmissionRepository;
        this.studentRepository = studentRepository;
        this.courseOfferingRepository = courseOfferingRepository;
    }

    private String resolveTenantId() {
        String tenantId = TenantContext.getTenantId();
        return (tenantId != null && !tenantId.isBlank()) ? tenantId : "default";
    }

    @Override
    public void validateExamAccess(Exam exam, String clientIp, String providedPin) {
        if (exam == null) {
            throw new EduPulseBusinessException("Exam cannot be null", HttpStatus.NOT_FOUND);
        }

        // 1. Physical Layer Subnet Whitelist Validation
        String allowedSubnet = exam.getAllowedIpSubnet();
        if (allowedSubnet != null && !allowedSubnet.isBlank()) {
            if (!isIpInSubnet(clientIp, allowedSubnet)) {
                log.warn("Physical Layer Proctoring Violation: Client IP [{}] rejected against allowed subnet [{}] for Exam [{}]",
                        clientIp, allowedSubnet, exam.getId());
                throw new EduPulseBusinessException(
                        "Physical proctoring violation: IP address '" + clientIp + "' is not within the authorized institutional computer lab subnet (" + allowedSubnet + ")",
                        HttpStatus.FORBIDDEN);
            }
        }

        // 2. Dynamic Exam PIN Verification
        String requiredPin = exam.getExamPin();
        if (requiredPin != null && !requiredPin.isBlank()) {
            if (providedPin == null || !providedPin.trim().equalsIgnoreCase(requiredPin.trim())) {
                log.warn("Physical Layer Proctoring Violation: Invalid PIN supplied for Exam [{}] from IP [{}]",
                        exam.getId(), clientIp);
                throw new EduPulseBusinessException(
                        "Physical proctoring violation: Invalid exam PIN provided",
                        HttpStatus.FORBIDDEN);
            }
        }
    }

    @Override
    public boolean isIpInSubnet(String clientIp, String allowedIpSubnet) {
        if (allowedIpSubnet == null || allowedIpSubnet.isBlank() || "*".equals(allowedIpSubnet.trim())) {
            return true;
        }
        if (clientIp == null || clientIp.isBlank()) {
            return false;
        }

        String normalizedIp = clientIp.trim();
        String[] rules = allowedIpSubnet.split("[,;\\s]+");
        for (String rule : rules) {
            String trimmedRule = rule.trim();
            if (trimmedRule.isEmpty()) {
                continue;
            }
            if (matchesSubnetRule(normalizedIp, trimmedRule)) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesSubnetRule(String ip, String rule) {
        if ("*".equals(rule)) {
            return true;
        }

        // Handle localhost equality across IPv4 and IPv6 loopback
        if (isLoopback(ip) && isLoopback(rule)) {
            return true;
        }

        if (rule.equalsIgnoreCase(ip)) {
            return true;
        }

        // Wildcard e.g. 192.168.1.*
        if (rule.endsWith(".*")) {
            String prefix = rule.substring(0, rule.length() - 1);
            return ip.startsWith(prefix);
        }

        // CIDR notation e.g. 192.168.1.0/24 or 10.0.0.0/16
        if (rule.contains("/")) {
            try {
                String[] parts = rule.split("/");
                String networkAddress = parts[0].trim();
                int prefixLength = Integer.parseInt(parts[1].trim());

                byte[] ipBytes = InetAddress.getByName(ip).getAddress();
                byte[] netBytes = InetAddress.getByName(networkAddress).getAddress();

                if (ipBytes.length != netBytes.length) {
                    return false;
                }

                int fullBytes = prefixLength / 8;
                int remainingBits = prefixLength % 8;

                for (int i = 0; i < fullBytes; i++) {
                    if (ipBytes[i] != netBytes[i]) {
                        return false;
                    }
                }

                if (remainingBits > 0 && fullBytes < ipBytes.length) {
                    int mask = (0xFF << (8 - remainingBits)) & 0xFF;
                    if ((ipBytes[fullBytes] & mask) != (netBytes[fullBytes] & mask)) {
                        return false;
                    }
                }

                return true;
            } catch (Exception e) {
                log.warn("Failed to parse CIDR rule [{}] against IP [{}]: {}", rule, ip, e.getMessage());
                return false;
            }
        }

        return false;
    }

    private boolean isLoopback(String host) {
        return "127.0.0.1".equals(host) || "localhost".equalsIgnoreCase(host) || "0:0:0:0:0:0:0:1".equals(host) || "::1".equals(host);
    }

    @Override
    public ExamStartResponseDTO startExam(Long examId, ExamStartRequestDTO request, String clientIp) {
        String tenantId = resolveTenantId();
        Exam exam = examRepository.findByIdAndTenantId(examId, tenantId)
                .orElseThrow(() -> new EduPulseBusinessException("Exam not found with ID: " + examId, HttpStatus.NOT_FOUND));

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new EduPulseBusinessException("Access denied: Exam is not published for administration", HttpStatus.FORBIDDEN);
        }

        // Validate physical layer proctoring constraints (Subnet and PIN)
        String providedPin = request != null ? request.getExamPin() : null;
        validateExamAccess(exam, clientIp, providedPin);

        // Resolve authenticated student
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Student student = resolveCurrentStudent(auth, tenantId);

        // Enforce student course enrollment RBAC
        List<Long> enrolledCourseIds = getEnrolledCourseIds(student, tenantId);
        Long examCourseId = exam.getCourseId();
        if (examCourseId != null && !enrolledCourseIds.contains(examCourseId)) {
            throw new EduPulseBusinessException("Access denied: Student is not enrolled in the course for this exam", HttpStatus.FORBIDDEN);
        }

        // Retrieve or initiate exam submission
        ExamSubmission submission = examSubmissionRepository.findByExamIdAndStudentIdAndTenantId(examId, student.getId(), tenantId)
                .orElseGet(() -> {
                    ExamSubmission sub = new ExamSubmission();
                    sub.setExam(exam);
                    sub.setStudent(student);
                    sub.setStartedAt(LocalDateTime.now());
                    sub.setStatus("STARTED");
                    sub.setClientIp(clientIp);
                    sub.setTenantId(tenantId);
                    return sub;
                });

        if ("SUBMITTED".equalsIgnoreCase(submission.getStatus()) || "EVALUATED".equalsIgnoreCase(submission.getStatus())) {
            throw new EduPulseBusinessException("Access denied: You have already submitted this examination", HttpStatus.FORBIDDEN);
        }

        submission.setClientIp(clientIp);
        if (submission.getStartedAt() == null) {
            submission.setStartedAt(LocalDateTime.now());
        }
        ExamSubmission savedSubmission = examSubmissionRepository.save(submission);

        // Fetch questions without exposing correct answers to test taker
        List<ExamQuestion> questions = examQuestionRepository.findByExamIdAndTenantIdOrderByOrderIndexAsc(examId, tenantId);
        List<ExamQuestionDTO> questionDTOs = questions.stream()
                .map(q -> ExamQuestionDTO.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .questionType(q.getQuestionType())
                        .optionsJson(q.getOptionsJson())
                        .marks(q.getMarks())
                        .orderIndex(q.getOrderIndex())
                        .build())
                .toList();

        log.info("Student [{}] started exam [{}] from validated IP [{}] under tenant [{}]",
                student.getId(), examId, clientIp, tenantId);

        return ExamStartResponseDTO.builder()
                .submissionId(savedSubmission.getId())
                .examId(exam.getId())
                .title(exam.getTitle())
                .durationMinutes(exam.getDurationMinutes())
                .startedAt(savedSubmission.getStartedAt())
                .clientIp(clientIp)
                .questions(questionDTOs)
                .status(savedSubmission.getStatus())
                .build();
    }

    @Override
    public String extractClientIp(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            String firstIp = xff.split(",")[0].trim();
            if (!firstIp.isEmpty() && !"unknown".equalsIgnoreCase(firstIp)) {
                return firstIp;
            }
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank() && !"unknown".equalsIgnoreCase(realIp)) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
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

    private List<Long> getEnrolledCourseIds(Student student, String tenantId) {
        if (student == null || student.getBatch() == null) {
            return Collections.emptyList();
        }
        Long batchId = student.getBatch().getId();
        List<CourseOffering> offerings = courseOfferingRepository.findByBatchIdAndTenantId(batchId, tenantId);
        return offerings.stream()
                .map(o -> o.getCourse() != null ? o.getCourse().getId() : null)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }
}
