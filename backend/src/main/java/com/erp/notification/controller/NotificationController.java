package com.erp.notification.controller;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.UserPrincipal;
import com.erp.auth.repository.UserRepository;
import com.erp.notification.dto.CreateNotificationRequest;
import com.erp.notification.dto.NotificationResponseDto;
import com.erp.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public NotificationController(UserRepository userRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null) return null;
        if (auth.getPrincipal() instanceof UserPrincipal up && up.getId() != null) {
            return up.getId();
        }
        return userRepository.findByUsernameIgnoreCase(auth.getName())
                .map(AppUser::getId)
                .orElse(null);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponseDto>> getMyNotifications(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        if (userId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        if (userId == null) {
            return ResponseEntity.ok(Map.of("unreadCount", 0L, "count", 0L));
        }
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count, "count", count));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationResponseDto> markAsRead(@PathVariable Long id, Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        NotificationResponseDto updated = notificationService.markAsRead(id, currentUserId, isAdmin);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> markAllAsRead(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        if (userId == null) {
            return ResponseEntity.ok(Map.of("marked", 0));
        }
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("marked", count));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NotificationResponseDto> createNotification(@RequestBody CreateNotificationRequest request) {
        NotificationResponseDto record = notificationService.createNotification(
                request.userId(),
                request.title(),
                request.message(),
                request.type(),
                request.link()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(record);
    }
}
