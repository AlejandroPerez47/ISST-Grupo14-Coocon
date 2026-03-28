package com.touristcocoon.controller;

import com.touristcocoon.domain.Reserva;
import com.touristcocoon.service.ReservationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody CreateReservationRequest request) {
        try {
            Reserva res = reservationService.createReservation(
                    request.getGuestDni(),
                    request.getCapsuleId(),
                    request.getStartDate(),
                    request.getEndDate()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @Data
    public static class CreateReservationRequest {
        private String guestDni;
        private UUID capsuleId;
        private LocalDate startDate;
        private LocalDate endDate;
    }
}
