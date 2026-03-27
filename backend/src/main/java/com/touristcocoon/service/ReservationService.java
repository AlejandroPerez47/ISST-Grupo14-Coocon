package com.touristcocoon.service;

import com.touristcocoon.domain.Capsule;
import com.touristcocoon.domain.Guest;
import com.touristcocoon.domain.Reservation;
import com.touristcocoon.repository.CapsuleRepository;
import com.touristcocoon.repository.GuestRepository;
import com.touristcocoon.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final CapsuleRepository capsuleRepository;
    private final GuestRepository guestRepository;

    @Transactional
    public Reservation createReservation(String dni, UUID capsuleId, LocalDate startDate, LocalDate endDate) {
        // Validate dates
        if (startDate.isBefore(LocalDate.now()) || endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Fechas de reserva inválidas.");
        }

        // Rule 1: Max 7 consecutive nights
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        if (daysBetween > 7) {
            throw new IllegalArgumentException("La reserva excede el límite legal de 7 noches consecutivas.");
        }

        // Rule 2: Max 15 days in the same calendar month
        validateMax15DaysPerMonth(dni, startDate, endDate);

        // Validate capsule availability
        validateCapsuleAvailability(capsuleId, startDate, endDate);

        Reservation reservation = Reservation.builder()
                .guestDni(dni)
                .capsuleId(capsuleId)
                .startDate(startDate)
                .endDate(endDate)
                .status(Reservation.ReservationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return reservationRepository.save(reservation);
    }

    private void validateMax15DaysPerMonth(String dni, LocalDate startDate, LocalDate endDate) {
        // Obtenemos las reservas del huésped en el mes actual para validarlo (simplificado)
        List<Reservation> userReservations = reservationRepository.findByGuestDni(dni);
        
        int month = startDate.getMonthValue();
        int year = startDate.getYear();
        
        long totalDaysInMonth = userReservations.stream()
                .filter(r -> r.getStatus() != Reservation.ReservationStatus.CANCELLED)
                .filter(r -> r.getStartDate().getMonthValue() == month && r.getStartDate().getYear() == year)
                .mapToLong(r -> ChronoUnit.DAYS.between(
                        r.getStartDate().isBefore(startDate.withDayOfMonth(1)) ? startDate.withDayOfMonth(1) : r.getStartDate(),
                        r.getEndDate().isAfter(startDate.withDayOfMonth(startDate.lengthOfMonth())) ? startDate.withDayOfMonth(startDate.lengthOfMonth()) : r.getEndDate()
                ))
                .sum();
                
        long daysRequested = ChronoUnit.DAYS.between(startDate, endDate);
        
        if (totalDaysInMonth + daysRequested > 15) {
            throw new IllegalArgumentException("La reserva hace que el huésped supere los 15 días naturales permitidos por mes.");
        }
    }

    private void validateCapsuleAvailability(UUID capsuleId, LocalDate startDate, LocalDate endDate) {
        List<Reservation> conflicts = reservationRepository
                .findByCapsuleIdAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndStatusNot(
                        capsuleId, endDate, startDate, Reservation.ReservationStatus.CANCELLED
                );

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("La cápsula seleccionada no está disponible en esas fechas.");
        }
    }
    
    public Reservation getReservation(UUID id) {
        return reservationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));
    }
}
