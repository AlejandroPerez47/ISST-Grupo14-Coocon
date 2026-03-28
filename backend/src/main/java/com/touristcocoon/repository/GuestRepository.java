package com.touristcocoon.repository;

import com.touristcocoon.domain.Huesped;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestRepository extends JpaRepository<Huesped, String> {
}
