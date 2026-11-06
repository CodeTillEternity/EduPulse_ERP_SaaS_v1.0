package com.erp.multitenancy.model;

/**
 * Lifecycle states for SaaS tenant accounts.
 */
public enum TenantStatus {
    REGISTERED,
    PROVISIONING,
    PROVISIONING_FAILED,
    TRIAL_ACTIVE,
    ACTIVE,
    SUSPENDED,
    PENDING_DELETION,
    DELETED
}
