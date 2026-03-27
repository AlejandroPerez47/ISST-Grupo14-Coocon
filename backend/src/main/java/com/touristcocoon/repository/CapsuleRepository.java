package com.touristcocoon.repository;

import com.touristcocoon.domain.Capsule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CapsuleRepository extends JpaRepository<Capsule, UUID> {
    Optional<Capsule> findByRoomNumber(int roomNumber);
}
