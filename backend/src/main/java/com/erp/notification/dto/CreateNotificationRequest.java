package com.erp.notification.dto;

public record CreateNotificationRequest(
        Long userId,
        String title,
        String message,
        String type,
        String link
) {
    public CreateNotificationRequest(Long userId, String title, String message, String type) {
        this(userId, title, message, type, null);
    }
}
