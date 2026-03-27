package com.touristcocoon.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "guests")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guest {

    @Id
    @Column(name = "dni", nullable = false, length = 20, unique = true)
    private String dni;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 150)
    private String lastName;

    @Column(name = "email", nullable = false, length = 150, unique = true)
    private String email;

}
