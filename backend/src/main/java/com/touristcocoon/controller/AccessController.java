package com.touristcocoon.controller;

import com.touristcocoon.service.AccessService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/access")
@RequiredArgsConstructor
public class AccessController {

    private final AccessService accessService;

    @PostMapping("/open")
    public ResponseEntity<?> openCapsuleDoor(@RequestBody AccessRequest request) {
        try {
            boolean success = accessService.openCapsuleDoor(
                    request.getCapsuleId(),
                    request.getGuestDni(),
                    request.getPin()
            );
            if (success) {
                return ResponseEntity.ok("Puerta desbloqueada correctamente.");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No se pudo abrir la puerta.");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @Data
    public static class AccessRequest {
        private UUID capsuleId;
        private String guestDni;
        private String pin;
    }
}
