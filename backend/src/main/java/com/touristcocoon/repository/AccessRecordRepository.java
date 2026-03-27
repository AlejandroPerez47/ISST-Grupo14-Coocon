package com.touristcocoon.repository;

import com.touristcocoon.domain.AccessRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccessRecordRepository extends JpaRepository<AccessRecord, UUID> {
    List<AccessRecord> findByGuestDniOrderByTimestampDesc(String guestDni);
    List<AccessRecord> findByCapsuleIdOrderByTimestampDesc(UUID capsuleId);
}
