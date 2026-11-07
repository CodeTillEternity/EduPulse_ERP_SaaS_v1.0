package com.erp.notification.repository;

import com.erp.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.read = false AND (:tenantId IS NULL OR n.tenantId = :tenantId)")
    int markAllAsReadForUserAndTenant(@Param("userId") Long userId, @Param("tenantId") String tenantId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.read = false")
    int markAllAsReadForUser(@Param("userId") Long userId);

    Optional<Notification> findFirstByUserIdAndTitleIgnoreCaseAndMessageIgnoreCaseAndCreatedAtAfter(
            Long userId, String title, String message, LocalDateTime after
    );
}
