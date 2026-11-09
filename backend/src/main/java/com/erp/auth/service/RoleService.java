package com.erp.auth.service;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

/**
 * Service managing user roles and permissions with Redis caching.
 * Caches role lookups for 60 minutes to handle massive concurrent login spikes.
 */
@Service
public class RoleService {

    private static final Logger log = LoggerFactory.getLogger(RoleService.class);

    private final UserRepository userRepository;

    public RoleService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Resolves user roles with Redis caching.
     * Low-mutation, high-throughput query executed during authentication and RBAC checks.
     */
    @Cacheable(value = "userRoles", key = "#username != null ? #username.toLowerCase() : ''")
    @Transactional(readOnly = true)
    public List<String> getUserRoles(String username) {
        log.debug("Cache miss for getUserRoles: querying PostgreSQL for username [{}]", username);
        if (username == null || username.isBlank()) {
            return Collections.emptyList();
        }

        return userRepository.findByUsernameIgnoreCase(username.trim())
                .or(() -> userRepository.findByEmailIgnoreCase(username.trim()))
                .map(user -> List.of(user.getRole().name()))
                .orElse(Collections.emptyList());
    }

    /**
     * Updates user role and evicts the cached role entry from Redis.
     */
    @CacheEvict(value = "userRoles", key = "#username != null ? #username.toLowerCase() : ''")
    @Transactional
    public void updateUserRole(String username, Role newRole) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username cannot be blank");
        }

        AppUser user = userRepository.findByUsernameIgnoreCase(username.trim())
                .or(() -> userRepository.findByEmailIgnoreCase(username.trim()))
                .orElseThrow(() -> new IllegalArgumentException("User not found with identifier: " + username));

        user.setRole(newRole);
        userRepository.save(user);
        log.info("Updated role to [{}] for user [{}] and evicted userRoles cache", newRole, username);
    }

    /**
     * Explicitly evicts user roles from Redis cache when permissions change.
     */
    @CacheEvict(value = "userRoles", key = "#username != null ? #username.toLowerCase() : ''")
    public void evictUserRoles(String username) {
        log.info("Evicted userRoles cache for [{}]", username);
    }
}
