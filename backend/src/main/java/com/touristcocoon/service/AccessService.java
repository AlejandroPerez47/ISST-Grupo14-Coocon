package com.touristcocoon.service;

import com.touristcocoon.domain.AccessRecord;
import com.touristcocoon.domain.Reservation;
import com.touristcocoon.repository.AccessRecordRepository;
import com.touristcocoon.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccessService {

    private final ReservationRepository reservationRepository;
    private final AccessRecordRepository accessRecordRepository;

    @Transactional
    public boolean openCapsuleDoor(UUID capsuleId, String guestDni, String pinSubmitted) {
        
        List<Reservation> activeReservations = reservationRepository.findByCapsuleIdAndStatus(capsuleId, Reservation.ReservationStatus.CHECKED_IN);
        
        Reservation activeReservation = activeReservations.stream()
                .filter(res -> res.getGuestDni().equalsIgnoreCase(guestDni))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No hay una reserva activa (Checked In) para este huésped y cápsula."));

        // Validar el PIN
        if (!activeReservation.getAccessPin().equals(pinSubmitted)) {
            throw new IllegalArgumentException("PIN de acceso incorrecto.");
        }

        // Guardar el registro inalterable de apertura (Auditoría de seguridad)
        AccessRecord record = AccessRecord.builder()
                .capsuleId(capsuleId)
                .guestDni(guestDni)
                .action(AccessRecord.ActionType.OPEN_DOOR)
                .timestamp(LocalDateTime.now())
                .build();
                
        accessRecordRepository.save(record);

        // Simulamos envío de señal al IoT de la puerta
        return true; 
    }
}
