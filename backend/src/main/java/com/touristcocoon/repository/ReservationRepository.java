package com.touristcocoon.repository;

import com.touristcocoon.domain.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reserva, UUID> {
    List<Reserva> findByGuestDniIgnoreCase(String guestDni);
    List<Reserva> findByCapsuleIdAndStatus(UUID capsuleId, Reserva.EstadoReserva status);

    // Para validar ocupación de una cápsula en un rango de fechas
    List<Reserva> findByCapsuleIdAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndStatusNot(
        UUID capsuleId, LocalDate end, LocalDate start, Reserva.EstadoReserva status
    );
}
