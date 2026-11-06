package com.erp.auth.repository;

import com.erp.auth.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByUsernameIgnoreCase(String username);
    Optional<AppUser> findByEmailIgnoreCase(String email);

    Optional<AppUser> findByUsernameIgnoreCaseAndTenantId(String username, String tenantId);
    Optional<AppUser> findByEmailIgnoreCaseAndTenantId(String email, String tenantId);

    boolean existsByUsername(String username);
    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCaseAndTenantId(String username, String tenantId);
    boolean existsByEmailIgnoreCaseAndTenantId(String email, String tenantId);
}
