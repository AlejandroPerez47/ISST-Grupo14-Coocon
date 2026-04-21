package com.touristcocoon.service;

import com.touristcocoon.domain.Huesped;
import com.touristcocoon.dto.AuthResponse;
import com.touristcocoon.dto.LoginRequest;
import com.touristcocoon.dto.RegisterRequest;
import com.touristcocoon.repository.GuestRepository;
import com.touristcocoon.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final GuestRepository guestRepository;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        Huesped guest = guestRepository.findById(request.getDni())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!guest.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Contraseña incorrecta");
        }

        String token = jwtService.generateToken(guest.getDni());

        return AuthResponse.builder()
                .token(token)
                .role(guest.getRole())
                .nombre(guest.getFirstName())
                .dni(guest.getDni())
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (guestRepository.existsById(request.getDni())) {
            throw new IllegalArgumentException("El DNI ya está registrado");
        }

        Huesped newGuest = Huesped.builder()
                .dni(request.getDni())
                .firstName(request.getNombre())
                .lastName(request.getApellidos())
                .email(request.getEmail())
                .password(request.getPassword())
                .role("USER")
                .build();

        guestRepository.save(newGuest);

        String token = jwtService.generateToken(newGuest.getDni());

        return AuthResponse.builder()
                .token(token)
                .role("USER")
                .nombre(newGuest.getFirstName())
                .dni(newGuest.getDni())
                .build();
    }
}
