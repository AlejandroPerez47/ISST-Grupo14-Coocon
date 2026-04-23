package com.touristcocoon.controller;

import com.touristcocoon.domain.Capsula;
import com.touristcocoon.domain.Huesped;
import com.touristcocoon.domain.Reserva;
import com.touristcocoon.repository.CapsuleRepository;
import com.touristcocoon.repository.GuestRepository;
import com.touristcocoon.repository.ReservationRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CapsuleRepository capsuleRepository;
    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;

    private boolean checkAdmin() {
        String principalDni = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Huesped> guestOpt = guestRepository.findById(principalDni);
        return guestOpt.isPresent() && "ADMIN".equals(guestOpt.get().getRole());
    }

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getDashboardMetrics() {
        if (!checkAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acceso denegado. Se requiere nivel Gestor.");

        long totalCapsules = capsuleRepository.count();
        List<Reserva> all = reservationRepository.findAll();
        LocalDate today = LocalDate.now();
        
        // Cápsulas ocupadas = cápsulas distintas con reserva CHECKIN_HECHO cuyo rango incluye hoy
        long occupiedCapsules = all.stream()
                .filter(r -> r.getStatus() == Reserva.EstadoReserva.CHECKIN_HECHO)
                .filter(r -> !today.isBefore(r.getStartDate()) && !today.isAfter(r.getEndDate()))
                .map(r -> r.getCapsula().getId())
                .distinct()
                .count();
                
        long freeCapsules = totalCapsules - occupiedCapsules;

        long activeReservations = all.stream()
                .filter(r -> r.getStatus() == Reserva.EstadoReserva.CHECKIN_HECHO)
                .filter(r -> !today.isBefore(r.getStartDate()) && !today.isAfter(r.getEndDate()))
                .count();
        long futureReservations = all.stream()
                .filter(r -> r.getStatus() == Reserva.EstadoReserva.PENDIENTE || r.getStatus() == Reserva.EstadoReserva.CONFIRMADA)
                .count();
        long totalReservations = all.size();

        return ResponseEntity.ok(new DashboardMetrics(totalCapsules, occupiedCapsules, freeCapsules, activeReservations, futureReservations, totalReservations));
    }

    @PostMapping("/capsules")
    public ResponseEntity<?> createCapsule(@RequestBody CapsuleRequest request) {
        if (!checkAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acceso denegado.");

        if (capsuleRepository.findByRoomNumber(request.getRoomNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("La habitación con número " + request.getRoomNumber() + " ya existe.");
        }

        Capsula cap = Capsula.builder()
                .roomNumber(request.getRoomNumber())
                .build();
        
        capsuleRepository.save(cap);
        return ResponseEntity.ok("Cápsula creada exitosamente.");
    }

    @GetMapping("/active-guests")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getActiveGuests() {
        if (!checkAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acceso denegado.");

        List<ActiveGuestDTO> activeGuests = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == Reserva.EstadoReserva.CONFIRMADA || r.getStatus() == Reserva.EstadoReserva.CHECKIN_HECHO)
                .map(r -> {
                    String firstName = "Desconocido";
                    String lastName = "";
                    String dni = null;
                    if (r.getGuest() != null) {
                        firstName = r.getGuest().getFirstName();
                        lastName = r.getGuest().getLastName();
                        dni = r.getGuest().getDni();
                    }

                    Integer roomNumber = null;
                    if (r.getCapsula() != null) {
                        roomNumber = r.getCapsula().getRoomNumber();
                    }

                    return new ActiveGuestDTO(
                            dni,
                            firstName,
                            lastName,
                            r.getId(),
                            roomNumber,
                            r.getStartDate(),
                            r.getEndDate(),
                            r.getStatus().name()
                    );
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(activeGuests);
    }

    @GetMapping("/guests/{dni}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getGuestProfile(@PathVariable String dni) {
        if (!checkAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acceso denegado.");

        Optional<Huesped> guestOpt = guestRepository.findById(dni);
        if (guestOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Huésped no encontrado.");
        }
        Huesped guest = guestOpt.get();

        List<ReservationDTO> resList = reservationRepository.findByGuestDniIgnoreCase(dni).stream()
                .map(r -> new ReservationDTO(
                        r.getId(),
                        r.getCapsula() != null ? r.getCapsula().getRoomNumber() : null,
                        r.getStartDate(),
                        r.getEndDate(),
                        r.getStatus().name()
                ))
                .collect(Collectors.toList());

        GuestProfileDTO profile = new GuestProfileDTO(
                guest.getDni(),
                guest.getFirstName(),
                guest.getLastName(),
                guest.getEmail(),
                resList
        );

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/guests/{dni}")
    @Transactional
    public ResponseEntity<?> updateGuestProfile(@PathVariable String dni, @RequestBody UpdateGuestRequest request) {
        if (!checkAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acceso denegado.");

        Optional<Huesped> guestOpt = guestRepository.findById(dni);
        if (guestOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Huésped no encontrado.");
        }

        Huesped guest = guestOpt.get();
        guest.setFirstName(request.getFirstName());
        guest.setLastName(request.getLastName());
        guest.setEmail(request.getEmail());

        guestRepository.save(guest);

        return ResponseEntity.ok("Datos del huésped actualizados correctamente.");
    }

    @Data
    public static class DashboardMetrics {
        private final long totalCapsules;
        private final long occupiedCapsules;
        private final long freeCapsules;
        private final long activeReservations;
        private final long futureReservations;
        private final long totalReservations;
    }

    @Data
    public static class CapsuleRequest {
        private int roomNumber;
    }

    @Data
    public static class ActiveGuestDTO {
        private final String dni;
        private final String firstName;
        private final String lastName;
        private final UUID reservationId;
        private final Integer roomNumber;
        private final LocalDate startDate;
        private final LocalDate endDate;
        private final String status;
    }

    @Data
    public static class GuestProfileDTO {
        private final String dni;
        private final String firstName;
        private final String lastName;
        private final String email;
        private final List<ReservationDTO> reservations;
    }

    @Data
    public static class ReservationDTO {
        private final UUID id;
        private final Integer roomNumber;
        private final LocalDate startDate;
        private final LocalDate endDate;
        private final String status;
    }

    @Data
    public static class UpdateGuestRequest {
        private String firstName;
        private String lastName;
        private String email;
    }
}
