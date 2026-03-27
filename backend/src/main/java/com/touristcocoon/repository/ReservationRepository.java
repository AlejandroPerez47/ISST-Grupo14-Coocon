package com.touristcocoon.repository;

import com.touristcocoon.domain.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    List<Reservation> findByGuestDni(String guestDni);
    List<Reservation> findByCapsuleIdAndStatus(UUID capsuleId, Reservation.ReservationStatus status);
    
    // Para validar ocupación de una cápsula en un rango de fechas
    List<Reservation> findByCapsuleIdAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndStatusNot(
        UUID capsuleId, LocalDate end, LocalDate start, Reservation.ReservationStatus status
    );
}
