package com.erp.student.repository;

import com.erp.student.entity.StudentPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentPhotoRepository extends JpaRepository<StudentPhoto, Long> {

    Optional<StudentPhoto> findByStudentId(Long studentId);

    boolean existsByStudentId(Long studentId);

    void deleteByStudentId(Long studentId);
}
