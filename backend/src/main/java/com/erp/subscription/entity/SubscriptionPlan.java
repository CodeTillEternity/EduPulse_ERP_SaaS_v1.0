package com.erp.subscription.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Platform-owned entity defining subscription tier limits and quotas.
 */
@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "max_students", nullable = false)
    private Integer maxStudents;

    @Column(name = "max_storage_mb", nullable = false)
    private Integer maxStorageMb;

    @Column(name = "has_api_access", nullable = false)
    private Boolean hasApiAccess = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public SubscriptionPlan() {}

    public SubscriptionPlan(String name, Integer maxStudents, Integer maxStorageMb, Boolean hasApiAccess) {
        this.name = name;
        this.maxStudents = maxStudents;
        this.maxStorageMb = maxStorageMb;
        this.hasApiAccess = hasApiAccess != null ? hasApiAccess : false;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getMaxStudents() {
        return maxStudents;
    }

    public void setMaxStudents(Integer maxStudents) {
        this.maxStudents = maxStudents;
    }

    public Integer getMaxStorageMb() {
        return maxStorageMb;
    }

    public void setMaxStorageMb(Integer maxStorageMb) {
        this.maxStorageMb = maxStorageMb;
    }

    public Boolean getHasApiAccess() {
        return hasApiAccess;
    }

    public void setHasApiAccess(Boolean hasApiAccess) {
        this.hasApiAccess = hasApiAccess;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
