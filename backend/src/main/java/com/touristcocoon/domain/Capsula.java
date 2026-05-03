package com.touristcocoon.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "capsules")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Capsula {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "room_number", nullable = false, unique = true)
    private int roomNumber;

    @Column(name = "is_reserved", nullable = false)
    private boolean isReserved;

    // Claves foráneas hacia Hostal y Gestor
    @Column(name = "hostel_id")
    private UUID hostelId;

    @Column(name = "staff_id")
    private UUID staffId;

}
