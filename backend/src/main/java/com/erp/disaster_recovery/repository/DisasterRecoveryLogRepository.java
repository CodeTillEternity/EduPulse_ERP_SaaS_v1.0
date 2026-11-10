package com.erp.disaster_recovery.repository;

import com.erp.disaster_recovery.entity.BackupStatus;
import com.erp.disaster_recovery.entity.DisasterRecoveryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisasterRecoveryLogRepository extends JpaRepository<DisasterRecoveryLog, Long> {
    List<DisasterRecoveryLog> findByStatusOrderByTimestampDesc(BackupStatus status);
}
