package com.erp.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Enterprise domain exception representing business rule violations and validation faults.
 */
public class EduPulseBusinessException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public EduPulseBusinessException(String message) {
        super(message);
        this.status = HttpStatus.UNPROCESSABLE_ENTITY;
        this.errorCode = "BUSINESS_RULE_VIOLATION";
    }

    public EduPulseBusinessException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.errorCode = "BUSINESS_RULE_VIOLATION";
    }

    public EduPulseBusinessException(String message, String errorCode, HttpStatus status) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
