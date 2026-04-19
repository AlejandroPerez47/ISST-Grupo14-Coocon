package com.touristcocoon.service;

import com.touristcocoon.domain.Huesped;
import com.touristcocoon.domain.Reserva;
import com.touristcocoon.repository.GuestRepository;
import com.touristcocoon.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckInService {

    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;

    @Transactional
    public String performDigitalCheckIn(UUID reservationId, String scannedDni, String firstName, String lastName, String email) {
        Reserva reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));

        if (!reservation.getGuestDni().equalsIgnoreCase(scannedDni)) {
            throw new IllegalArgumentException("El DNI escaneado no coincide con la reserva.");
        }

        if (reservation.getStatus() == Reserva.EstadoReserva.CHECKIN_HECHO) {
            throw new IllegalStateException("El Check-in ya fue realizado previamente.");
        }

        // Registrar o actualizar el huésped con los datos reales escaneados del DNI
        Optional<Huesped> guestOpt = guestRepository.findById(scannedDni);
        if (guestOpt.isEmpty()) {
            Huesped newGuest = Huesped.builder()
                    .dni(scannedDni)
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password(UUID.randomUUID().toString())
                    .role("USER")
                    .build();
            guestRepository.save(newGuest);
        }

        // Generar PIN único de 6 cifras
        String rawPin = String.format("%06d", new Random().nextInt(999999));
        
        reservation.setAccessPin(rawPin);
        reservation.setStatus(Reserva.EstadoReserva.CHECKIN_HECHO);
        reservationRepository.save(reservation);

        return rawPin;
    }
}
