package com.erp.common.exception;

import org.springframework.http.HttpStatus;

public class BusinessException extends EduPulseBusinessException {

    public BusinessException(String message) {
        super(message, HttpStatus.CONFLICT);
    }

    public BusinessException(String message, HttpStatus status) {
        super(message, status);
    }
}
