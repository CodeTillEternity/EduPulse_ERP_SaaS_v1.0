package com.erp.notification.service;

import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.notification.JsonNotificationDataStoreManager;
import com.erp.notification.dto.NotificationResponseDto;
import com.erp.notification.entity.Notification;
import com.erp.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final JsonNotificationDataStoreManager devJsonNotificationManager;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            @Autowired(required = false) JsonNotificationDataStoreManager devJsonNotificationManager) {
        this.notificationRepository = notificationRepository;
        this.devJsonNotificationManager = devJsonNotificationManager;
    }

    @Override
    public NotificationResponseDto createNotification(Long userId, String title, String message, String type, String link) {
        if (userId == null) {
            throw new IllegalArgumentException("Target userId cannot be null for notification");
        }

        // Prevent duplicate notifications within 5 minutes for same user, title and message
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        Optional<Notification> duplicate = notificationRepository
                .findFirstByUserIdAndTitleIgnoreCaseAndMessageIgnoreCaseAndCreatedAtAfter(
                        userId, title, message, cutoff
                );

        if (duplicate.isPresent()) {
            log.debug("Skipping duplicate notification for userId={} with title='{}'", userId, title);
            return NotificationResponseDto.fromEntity(duplicate.get());
        }

        Notification notification = new Notification(userId, title, message, type, link);
        Notification saved = notificationRepository.save(notification);

        // Mirror to dev-json store if active
        if (devJsonNotificationManager != null) {
            try {
                devJsonNotificationManager.createNotification(userId, title, message, type, link);
            } catch (Exception e) {
                log.warn("Failed to mirror notification to dev-json store: {}", e.getMessage());
            }
        }

        return NotificationResponseDto.fromEntity(saved);
    }

    @Override
    public NotificationResponseDto createNotification(Long userId, String title, String message, String type) {
        return createNotification(userId, title, message, type, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getNotificationsForUser(Long userId) {
        if (userId == null) return List.of();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponseDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        if (userId == null) return 0L;
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Override
    public NotificationResponseDto markAsRead(Long id, Long currentUserId, boolean isAdmin) {
        if (id == null) {
            throw new IllegalArgumentException("Notification ID cannot be null");
        }
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        if (!isAdmin && (currentUserId == null || !currentUserId.equals(notification.getUserId()))) {
            throw new AccessDeniedException("You do not own this notification");
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);

        // Mirror to dev-json store if active
        if (devJsonNotificationManager != null) {
            try {
                devJsonNotificationManager.markAsRead(id);
            } catch (Exception ignored) {
            }
        }

        return NotificationResponseDto.fromEntity(updated);
    }

    @Override
    public int markAllAsRead(Long userId) {
        if (userId == null) return 0;
        String tenantId = com.erp.multitenancy.TenantContext.getTenantId();
        int count = (tenantId != null && !tenantId.isBlank())
                ? notificationRepository.markAllAsReadForUserAndTenant(userId, tenantId)
                : notificationRepository.markAllAsReadForUser(userId);

        // Mirror to dev-json store if active
        if (devJsonNotificationManager != null) {
            try {
                devJsonNotificationManager.markAllAsRead(userId);
            } catch (Exception ignored) {
            }
        }

        return count;
    }
}
