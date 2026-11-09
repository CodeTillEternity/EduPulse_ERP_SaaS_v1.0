package com.edupulse.core.domain.library;

import com.edupulse.core.domain.base.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Domain entity representing a physical book asset catalogued in the institutional library.
 * Extends BaseTenantEntity for automated multi-tenant isolation.
 */
@Entity(name = "LibraryCoreBookAsset")
@Table(
        name = "library_book_assets",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_library_book_isbn_tenant", columnNames = {"isbn", "tenant_id"})
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class BookAsset extends BaseTenantEntity {

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "author", nullable = false, length = 150)
    private String author;

    @Column(name = "isbn", nullable = false, length = 50)
    private String isbn;

    @Column(name = "total_copies", nullable = false)
    private Integer totalCopies;

    @Column(name = "available_copies", nullable = false)
    private Integer availableCopies;
}
