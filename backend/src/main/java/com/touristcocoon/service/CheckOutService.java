package com.touristcocoon.service;

import com.touristcocoon.domain.Capsula;
import com.touristcocoon.domain.Reserva;
import com.touristcocoon.repository.CapsuleRepository;
import com.touristcocoon.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckOutService {

    private final ReservationRepository reservationRepository;
    private final CapsuleRepository capsuleRepository;

    /**
     * Obtiene la reserva activa (CHECKIN_HECHO) de un huésped para mostrar
     * el resumen antes de confirmar el checkout.
     */
    public Reserva getActiveCheckedInReservation(String guestDni) {
        return reservationRepository.findByGuestDniIgnoreCase(guestDni).stream()
                .filter(r -> r.getStatus() == Reserva.EstadoReserva.CHECKIN_HECHO)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No se encontró ninguna reserva con check-in activo para el DNI: " + guestDni));
    }

    /**
     * Realiza el check-out digital:
     * 1. Valida que la reserva exista y pertenezca al huésped.
     * 2. Marca la reserva como COMPLETADA.
     * 3. Marca la cápsula como PENDIENTE_LIMPIEZA.
     */
    @Transactional
    public Reserva performCheckOut(UUID reservationId, String guestDni) {
        Reserva reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada."));

        if (!reservation.getGuest().getDni().equalsIgnoreCase(guestDni)) {
            throw new IllegalArgumentException("El DNI no coincide con el titular de la reserva.");
        }

        if (reservation.getStatus() != Reserva.EstadoReserva.CHECKIN_HECHO) {
            throw new IllegalStateException(
                    "Solo se puede hacer check-out de una reserva con check-in completado. Estado actual: "
                            + reservation.getStatus());
        }

        // Marcar reserva como completada
        reservation.setStatus(Reserva.EstadoReserva.COMPLETADA);
        // Invalidar el PIN por seguridad
        reservation.setAccessPin(null);
        reservationRepository.save(reservation);

        // Marcar la cápsula como pendiente de limpieza
        capsuleRepository.findById(reservation.getCapsula().getId()).ifPresent(capsula -> {
            capsula.setStatus(Capsula.EstadoCapsula.PENDIENTE_LIMPIEZA);
            capsuleRepository.save(capsula);
        });

        return reservation;
    }
}
