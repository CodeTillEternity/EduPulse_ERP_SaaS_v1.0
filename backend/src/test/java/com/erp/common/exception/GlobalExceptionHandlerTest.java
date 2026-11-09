package com.erp.common.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        request = new MockHttpServletRequest();
        request.setRequestURI("/api/v1/test-endpoint");
    }

    @Test
    @DisplayName("RFC 7807: Should map EntityNotFoundException to 404 ProblemDetail")
    void testHandleEntityNotFoundException() {
        EntityNotFoundException ex = new EntityNotFoundException("Student", "id", 99L);

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleEntityNotFoundException(ex, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        ProblemDetail body = response.getBody();
        assertNotNull(body);
        assertEquals(404, body.getStatus());
        assertEquals("Entity Not Found", body.getTitle());
        assertEquals("Student not found with id: '99'", body.getDetail());
        assertEquals("/api/v1/test-endpoint", body.getProperties().get("path"));
        assertNotNull(body.getProperties().get("timestamp"));
        assertEquals("ENTITY_NOT_FOUND", body.getProperties().get("errorCode"));
    }

    @Test
    @DisplayName("RFC 7807: Should map AccessDeniedException to 403 ProblemDetail")
    void testHandleAccessDeniedException() {
        AccessDeniedException ex = new AccessDeniedException("Access denied by institutional RBAC");

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleAccessDeniedException(ex, request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        ProblemDetail body = response.getBody();
        assertNotNull(body);
        assertEquals(403, body.getStatus());
        assertEquals("Access Denied", body.getTitle());
        assertEquals("Access denied by institutional RBAC", body.getDetail());
        assertEquals("/api/v1/test-endpoint", body.getProperties().get("path"));
        assertNotNull(body.getProperties().get("timestamp"));
    }

    @Test
    @DisplayName("RFC 7807: Should map MethodArgumentNotValidException to 400 ProblemDetail with field errors")
    void testHandleValidationException() throws Exception {
        Object target = new Object();
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(target, "requestDto");
        bindingResult.addError(new FieldError("requestDto", "email", "must be a well-formed email address"));
        bindingResult.addError(new FieldError("requestDto", "amount", "must be greater than 0"));

        MethodParameter parameter = new MethodParameter(
                GlobalExceptionHandlerTest.class.getDeclaredMethod("setUp"), -1
        );
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleValidationException(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ProblemDetail body = response.getBody();
        assertNotNull(body);
        assertEquals(400, body.getStatus());
        assertEquals("Validation Failed", body.getTitle());
        assertEquals("/api/v1/test-endpoint", body.getProperties().get("path"));

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) body.getProperties().get("validationErrors");
        assertNotNull(errors);
        assertEquals(2, errors.size());
        assertEquals("must be a well-formed email address", errors.get("email"));
        assertEquals("must be greater than 0", errors.get("amount"));
    }

    @Test
    @DisplayName("RFC 7807: Should map EduPulseBusinessException to structured ProblemDetail")
    void testHandleEduPulseBusinessException() {
        EduPulseBusinessException ex = new EduPulseBusinessException(
                "Fee payment amount cannot exceed outstanding balance",
                "PAYMENT_OVERFLOW",
                HttpStatus.CONFLICT
        );

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleEduPulseBusinessException(ex, request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        ProblemDetail body = response.getBody();
        assertNotNull(body);
        assertEquals(409, body.getStatus());
        assertEquals("Business Rule Violation", body.getTitle());
        assertEquals("Fee payment amount cannot exceed outstanding balance", body.getDetail());
        assertEquals("PAYMENT_OVERFLOW", body.getProperties().get("errorCode"));
        assertNotNull(body.getProperties().get("timestamp"));
    }

    @Test
    @DisplayName("RFC 7807: Should sanitize unexpected Exception with 500 ProblemDetail and correlationId without stack trace")
    void testHandleGlobalException() {
        Exception ex = new NullPointerException("Null pointer reference in core calculation engine");

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleGlobalException(ex, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        ProblemDetail body = response.getBody();
        assertNotNull(body);
        assertEquals(500, body.getStatus());
        assertEquals("Internal Server Error", body.getTitle());
        assertTrue(body.getDetail().contains("An unexpected server error occurred. Please contact support with reference ID:"));
        // Confirm raw stack trace or exception class message is not leaked in the client detail
        assertFalse(body.getDetail().contains("Null pointer reference"));
        assertNotNull(body.getProperties().get("correlationId"));
        assertNotNull(body.getProperties().get("timestamp"));
    }
}
