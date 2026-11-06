package com.erp.notification.service;

import com.erp.notification.dto.NotificationResponseDto;

import java.util.List;

public interface NotificationService {

    NotificationResponseDto createNotification(Long userId, String title, String message, String type, String link);

    NotificationResponseDto createNotification(Long userId, String title, String message, String type);

    List<NotificationResponseDto> getNotificationsForUser(Long userId);

    long getUnreadCount(Long userId);

    NotificationResponseDto markAsRead(Long id, Long currentUserId, boolean isAdmin);

    int markAllAsRead(Long userId);
}
