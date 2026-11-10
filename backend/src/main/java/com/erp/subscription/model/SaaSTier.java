package com.erp.subscription.model;

/**
 * SaaS Commercial Subscription Tiers defining feature entitlements and quotas.
 */
public enum SaaSTier {
    FREE(0),
    TRIAL(1),
    STARTER(1),
    PRO(2),
    ENTERPRISE(3);

    private final int rank;

    SaaSTier(int rank) {
        this.rank = rank;
    }

    public int getRank() {
        return rank;
    }

    /**
     * Determines whether this tier satisfies the required tier rank.
     *
     * @param required the minimum required tier
     * @return true if this tier's rank is greater than or equal to required
     */
    public boolean satisfies(SaaSTier required) {
        if (required == null) {
            return true;
        }
        return this.rank >= required.rank;
    }

    /**
     * Safely parses a tier string representation, defaulting to TRIAL.
     *
     * @param tierName string name of the tier
     * @return the matching SaaSTier
     */
    public static SaaSTier fromString(String tierName) {
        if (tierName == null || tierName.isBlank()) {
            return TRIAL;
        }
        String normalized = tierName.trim().toUpperCase();
        for (SaaSTier tier : values()) {
            if (tier.name().equals(normalized)) {
                return tier;
            }
        }
        return TRIAL;
    }
}
