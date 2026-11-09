package com.erp.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Standardized global exception handler compliant with RFC 7807 (Problem Details for HTTP APIs).
 * Intercepts application exceptions, maps them to structured ProblemDetail responses,
 * and ensures raw server stack traces are never exposed to clients.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private ProblemDetail buildProblemDetail(HttpStatus status, String title, String detail, String path, String errorCode) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setType(URI.create("https://api.edupulse.com/errors/" + (errorCode != null ? errorCode.toLowerCase() : status.name().toLowerCase())));
        if (path != null) {
            problem.setInstance(URI.create(path));
            problem.setProperty("path", path);
        }
        problem.setProperty("timestamp", Instant.now().toString());
        problem.setProperty("status", status.value());
        problem.setProperty("message", detail);
        if (errorCode != null) {
            problem.setProperty("errorCode", errorCode);
        }
        return problem;
    }

    /**
     * Intercepts domain EntityNotFoundException, ResourceNotFoundException, and JPA EntityNotFoundException.
     * RFC 7807: 404 NOT_FOUND.
     */
    @ExceptionHandler({EntityNotFoundException.class, ResourceNotFoundException.class, jakarta.persistence.EntityNotFoundException.class})
    public ResponseEntity<ProblemDetail> handleEntityNotFoundException(Exception ex, HttpServletRequest request) {
        log.warn("Entity not found at [{}]: {}", request.getRequestURI(), ex.getMessage());
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.NOT_FOUND,
                "Entity Not Found",
                ex.getMessage(),
                request.getRequestURI(),
                "ENTITY_NOT_FOUND"
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    /**
     * Intercepts security authorization rejections.
     * RFC 7807: 403 FORBIDDEN.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied at [{}]: {}", request.getRequestURI(), ex.getMessage());
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.FORBIDDEN,
                "Access Denied",
                ex.getMessage() != null && !ex.getMessage().isBlank()
                        ? ex.getMessage()
                        : "You do not have permission to access this resource",
                request.getRequestURI(),
                "FORBIDDEN_OPERATION"
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problem);
    }

    /**
     * Intercepts Bean Validation failures (e.g. @Valid, @NotNull, @Size).
     * RFC 7807: 400 BAD_REQUEST with structured validationErrors map.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> validationErrors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            validationErrors.put(error.getField(), error.getDefaultMessage());
        }

        log.warn("Validation failure at [{}] with {} errors", request.getRequestURI(), validationErrors.size());
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.BAD_REQUEST,
                "Validation Failed",
                "Input payload contains validation errors",
                request.getRequestURI(),
                "VALIDATION_FAILED"
        );
        problem.setProperty("validationErrors", validationErrors);
        problem.setProperty("errors", validationErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    /**
     * Intercepts custom EduPulse business rule violations.
     * RFC 7807: 422 UNPROCESSABLE_ENTITY or configured status.
     */
    @ExceptionHandler(EduPulseBusinessException.class)
    public ResponseEntity<ProblemDetail> handleEduPulseBusinessException(EduPulseBusinessException ex, HttpServletRequest request) {
        HttpStatus status = ex.getStatus() != null ? ex.getStatus() : HttpStatus.UNPROCESSABLE_ENTITY;
        log.warn("Business rule violation [{}] at [{}]: {}", ex.getErrorCode(), request.getRequestURI(), ex.getMessage());

        ProblemDetail problem = buildProblemDetail(
                status,
                "Business Rule Violation",
                ex.getMessage(),
                request.getRequestURI(),
                ex.getErrorCode()
        );
        return ResponseEntity.status(status).body(problem);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ProblemDetail> handleCustomValidationException(ValidationException ex, HttpServletRequest request) {
        log.warn("Validation exception at [{}]: {}", request.getRequestURI(), ex.getMessage());
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.BAD_REQUEST,
                "Validation Error",
                ex.getMessage(),
                request.getRequestURI(),
                "VALIDATION_ERROR"
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("Illegal argument at [{}]: {}", request.getRequestURI(), ex.getMessage());
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.BAD_REQUEST,
                "Invalid Request Parameter",
                ex.getMessage(),
                request.getRequestURI(),
                "INVALID_ARGUMENT"
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ProblemDetail> handleIllegalStateException(IllegalStateException ex, HttpServletRequest request) {
        log.warn("Illegal state conflict at [{}]: {}", request.getRequestURI(), ex.getMessage());
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.CONFLICT,
                "State Conflict",
                ex.getMessage(),
                request.getRequestURI(),
                "STATE_CONFLICT"
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ProblemDetail> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String msg = String.format("Invalid parameter value '%s' for parameter '%s'", ex.getValue(), ex.getName());
        log.warn("Type mismatch at [{}]: {}", request.getRequestURI(), msg);
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.BAD_REQUEST,
                "Type Mismatch",
                msg,
                request.getRequestURI(),
                "TYPE_MISMATCH"
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ProblemDetail> handleMaxSizeException(MaxUploadSizeExceededException ex, HttpServletRequest request) {
        log.warn("Max upload size exceeded at [{}]", request.getRequestURI());
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "Payload Too Large",
                "Uploaded file exceeds the maximum allowed size limit (10MB)",
                request.getRequestURI(),
                "PAYLOAD_TOO_LARGE"
        );
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(problem);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ProblemDetail> handleBadCredentialsException(BadCredentialsException ex, HttpServletRequest request) {
        log.warn("Bad credentials authentication failure at [{}]", request.getRequestURI());
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.UNAUTHORIZED,
                "Unauthorized",
                "Invalid username or password",
                request.getRequestURI(),
                "INVALID_CREDENTIALS"
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ProblemDetail> handleDisabledException(DisabledException ex, HttpServletRequest request) {
        log.warn("Disabled account attempt at [{}]", request.getRequestURI());
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.UNAUTHORIZED,
                "Account Disabled",
                "Account is disabled",
                request.getRequestURI(),
                "ACCOUNT_DISABLED"
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ProblemDetail> handleInvalidTokenException(InvalidTokenException ex, HttpServletRequest request) {
        log.warn("Invalid JWT token at [{}]", request.getRequestURI());
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.UNAUTHORIZED,
                "Invalid Token",
                ex.getMessage(),
                request.getRequestURI(),
                "INVALID_TOKEN"
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetail> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        log.warn("Authentication required at [{}]: {}", request.getRequestURI(), ex.getMessage());
        ProblemDetail problem = buildProblemDetail(
                HttpStatus.UNAUTHORIZED,
                "Unauthorized",
                ex.getMessage() != null ? ex.getMessage() : "Full authentication is required to access this resource",
                request.getRequestURI(),
                "UNAUTHORIZED"
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ProblemDetail> handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request) {
        String correlationId = UUID.randomUUID().toString();
        log.error("[{}] Database integrity constraint violation at [{}]: {}", correlationId, request.getRequestURI(), ex.getMessage(), ex);

        String userMessage = "A database conflict occurred. The submitted information or identifier is already in use.";
        if (ex.getMessage() != null && ex.getMessage().toUpperCase().contains("PHONE")) {
            userMessage = "The contact phone number is already registered. Please verify your contact information.";
        } else if (ex.getMessage() != null && ex.getMessage().toUpperCase().contains("EMAIL")) {
            userMessage = "The email address is already registered. Please use your existing account or provide another email.";
        }

        ProblemDetail problem = buildProblemDetail(
                HttpStatus.CONFLICT,
                "Database Conflict",
                userMessage,
                request.getRequestURI(),
                "DATA_INTEGRITY_VIOLATION"
        );
        problem.setProperty("correlationId", correlationId);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    /**
     * Fallback catch-all handler for unhandled exceptions.
     * Sanitizes errors to prevent exposing raw stack traces to clients.
     * RFC 7807: 500 INTERNAL_SERVER_ERROR with correlation tracking ID.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGlobalException(Exception ex, HttpServletRequest request) {
        String correlationId = UUID.randomUUID().toString();
        log.error("[{}] Internal server error at [{}]: {}", correlationId, request.getRequestURI(), ex.getMessage(), ex);

        ProblemDetail problem = buildProblemDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                "An unexpected server error occurred. Please contact support with reference ID: " + correlationId,
                request.getRequestURI(),
                "INTERNAL_SERVER_ERROR"
        );
        problem.setProperty("correlationId", correlationId);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }
}
