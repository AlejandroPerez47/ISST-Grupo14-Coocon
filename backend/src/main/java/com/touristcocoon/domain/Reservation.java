package com.touristcocoon.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reservations")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Relación con el huésped (solo guardamos el DNI como clave foránea simple para un acoplamiento suelto)
    @Column(name = "guest_dni", nullable = false, length = 20)
    private String guestDni;

    // Relación con la cápsula
    @Column(name = "capsule_id", nullable = false)
    private UUID capsuleId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // El PIN de 6 cifras generado para acceso (se desbloquea tras el Check-in)
    @Column(name = "access_pin", length = 6)
    private String accessPin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public enum ReservationStatus { 
        PENDING,       // Creada pero sin pagar o confirmar
        CONFIRMED,     // Pagada y confirmada, pendiente de check-in
        CHECKED_IN,    // Check-in digital completado (PIN Activo)
        COMPLETED,     // Estancia finalizada
        CANCELLED      // Cancelada
    }
}
