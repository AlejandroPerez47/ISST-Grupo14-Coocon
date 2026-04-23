package com.touristcocoon.service;


import com.touristcocoon.domain.Reserva;
import com.touristcocoon.domain.Capsula;
import com.touristcocoon.domain.Huesped;
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
    public Reserva createReservation(String dni, LocalDate startDate, LocalDate endDate) {
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

        // Retrieve all capsules to find an available one
        List<Capsula> allCapsules = capsuleRepository.findAll();
        if (allCapsules.isEmpty()) {
            throw new IllegalArgumentException("No hay cápsulas operativas en el hotel actualmente.");
        }

        Capsula assignedCapsule = null;
        for (Capsula capsule : allCapsules) {
            if (isCapsuleAvailable(capsule.getId(), startDate, endDate)) {
                assignedCapsule = capsule;
                break;
            }
        }

        if (assignedCapsule == null) {
            throw new IllegalArgumentException("No hay cápsulas libres para el periodo de fechas seleccionado.");
        }

        Huesped guest = guestRepository.findById(dni)
                .orElseThrow(() -> new IllegalArgumentException("Huésped no encontrado."));

        Reserva reservation = Reserva.builder()
                .guest(guest)
                .capsula(assignedCapsule)
                .startDate(startDate)
                .endDate(endDate)
                .status(Reserva.EstadoReserva.PENDIENTE)
                .createdAt(LocalDateTime.now())
                .build();

        return reservationRepository.save(reservation);
    }

    private void validateMax15DaysPerMonth(String dni, LocalDate startDate, LocalDate endDate) {
        // Obtenemos las reservas del huésped en el mes actual para validarlo (simplificado)
        List<Reserva> userReservations = reservationRepository.findByGuestDniIgnoreCase(dni);
        
        int month = startDate.getMonthValue();
        int year = startDate.getYear();
        
        long totalDaysInMonth = userReservations.stream()
                .filter(r -> r.getStatus() != Reserva.EstadoReserva.CANCELADA)
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

    private boolean isCapsuleAvailable(UUID capsuleId, LocalDate startDate, LocalDate endDate) {
        List<Reserva> conflicts = reservationRepository
                .findByCapsulaIdAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndStatusNot(
                        capsuleId, endDate, startDate, Reserva.EstadoReserva.CANCELADA
                );
        return conflicts.isEmpty();
    }
    
    @Transactional(readOnly = true)
    public Reserva getReservation(UUID id) {
        return reservationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));
    }

    @Transactional(readOnly = true)
    public List<Reserva> getActiveReservationsByDni(String dni) {
        List<Reserva> activeReservations = reservationRepository.findByGuestDniIgnoreCase(dni).stream()
                .filter(r -> r.getStatus() == Reserva.EstadoReserva.CONFIRMADA
                          || r.getStatus() == Reserva.EstadoReserva.PENDIENTE)
                .toList();
                
        if (activeReservations.isEmpty()) {
            throw new IllegalArgumentException("No se encontraron reservas activas para ese DNI.");
        }
        
        return activeReservations;
    }

    @Transactional(readOnly = true)
    public List<Reserva> getAllReservationsByDni(String dni) {
        List<Reserva> allReservations = reservationRepository.findByGuestDniIgnoreCase(dni);
        if (allReservations.isEmpty()) {
            throw new IllegalArgumentException("No se encontraron reservas para este usuario.");
        }
        return allReservations;
    }
}
