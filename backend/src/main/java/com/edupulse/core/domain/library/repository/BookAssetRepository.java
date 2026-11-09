package com.edupulse.core.domain.library.repository;

import com.edupulse.core.domain.library.BookAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for BookAsset physical catalog inventory.
 */
@Repository("coreBookAssetRepository")
public interface BookAssetRepository extends JpaRepository<BookAsset, Long> {

    List<BookAsset> findByTenantId(String tenantId);

    Optional<BookAsset> findByIdAndTenantId(Long id, String tenantId);

    Optional<BookAsset> findByIsbnAndTenantId(String isbn, String tenantId);

    List<BookAsset> findByTitleContainingIgnoreCaseAndTenantId(String title, String tenantId);

    boolean existsByIsbnAndTenantId(String isbn, String tenantId);
}
