package com.touristcocoon.controller;

import com.touristcocoon.domain.Reserva;
import com.touristcocoon.service.ReservationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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
            String principalDni = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!principalDni.equals(request.getGuestDni())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("El DNI de la reserva no coincide con el usuario autenticado.");
            }

            Reserva res = reservationService.createReservation(
                    request.getGuestDni(),
                    request.getStartDate(),
                    request.getEndDate()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/by-dni/{dni}")
    public ResponseEntity<?> getByDni(@PathVariable String dni) {
        try {
            return ResponseEntity.ok(reservationService.getActiveReservationsByDni(dni));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/all-by-dni/{dni}")
    public ResponseEntity<?> getAllByDni(@PathVariable String dni) {
        try {
            return ResponseEntity.ok(reservationService.getAllReservationsByDni(dni));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @Data
    public static class CreateReservationRequest {
        private String guestDni;
        private LocalDate startDate;
        private LocalDate endDate;
    }
}
