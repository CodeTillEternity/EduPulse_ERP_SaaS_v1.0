package com.erp.notification.dto;

import com.erp.notification.entity.Notification;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class NotificationResponseDto {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private String type;
    private String link;
    private Boolean read;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    public NotificationResponseDto() {
    }

    public NotificationResponseDto(Long id, Long userId, String title, String message, String type, String link, Boolean read, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.link = link;
        this.read = read;
        this.createdAt = createdAt;
    }

    public static NotificationResponseDto fromEntity(Notification entity) {
        if (entity == null) return null;
        return new NotificationResponseDto(
                entity.getId(),
                entity.getUserId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getType(),
                entity.getLink(),
                entity.getRead(),
                entity.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public Boolean getRead() {
        return read;
    }

    public void setRead(Boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
