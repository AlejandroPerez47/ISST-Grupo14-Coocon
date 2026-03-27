package com.touristcocoon.controller;

import com.touristcocoon.service.CheckInService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/checkin")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping("/{reservationId}")
    public ResponseEntity<?> processCheckIn(@PathVariable UUID reservationId, @RequestBody CheckInRequest request) {
        try {
            String pin = checkInService.performDigitalCheckIn(
                    reservationId,
                    request.getDni(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getEmail()
            );
            return ResponseEntity.ok(new CheckInResponse("Check-in completado exitosamente.", pin));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Data
    public static class CheckInRequest {
        private String dni;
        private String firstName;
        private String lastName;
        private String email;
    }

    @Data
    public static class CheckInResponse {
        private final String message;
        private final String accessPin;
    }
}
