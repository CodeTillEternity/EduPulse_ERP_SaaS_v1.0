package com.erp.finance.fee_structure.repository;
import com.erp.finance.fee_structure.entity.FeeStructure;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    Optional<FeeStructure> findByCode(String code);
    Optional<FeeStructure> findByProgramIdAndAcademicYearIdAndActiveTrue(Long programId, Long academicYearId);

    @EntityGraph(attributePaths = {"components", "components.feeHead"})
    @Query("SELECT DISTINCT f FROM FeeStructure f")
    List<FeeStructure> findAllWithComponents();

    @EntityGraph(attributePaths = {"components", "components.feeHead"})
    @Query("SELECT f FROM FeeStructure f WHERE f.id = :id")
    Optional<FeeStructure> findByIdWithComponents(@Param("id") Long id);
}
