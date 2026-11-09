package com.erp.auth.repository;

import com.erp.auth.entity.AppUser;
import com.erp.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for managing persistent RefreshToken records.
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByTokenAndTenantId(String token, String tenantId);

    Optional<RefreshToken> findByUser(AppUser user);

    @Modifying
    void deleteByUser(AppUser user);

    @Modifying
    void deleteByToken(String token);
}
