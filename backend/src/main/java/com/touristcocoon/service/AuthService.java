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
        String dniToSearch = request.getDni().toUpperCase();
        Huesped guest = guestRepository.findById(dniToSearch)
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
        String dniToRegister = request.getDni().toUpperCase();
        if (guestRepository.existsById(dniToRegister)) {
            throw new IllegalArgumentException("El DNI ya está registrado");
        }

        String finalRole = "USER";
        
        // Lógica automática para el Gestor
        if ("gestor@admin.com".equalsIgnoreCase(request.getEmail()) && "gestor".equals(request.getPassword())) {
            finalRole = "ADMIN";
        } else if (request.getManagerKey() != null && !request.getManagerKey().trim().isEmpty()) {
            if ("Cocooon14".equals(request.getManagerKey())) {
                finalRole = "ADMIN";
            } else {
                throw new IllegalArgumentException("Clave de autorización de gestor inválida.");
            }
        }

        Huesped newGuest = Huesped.builder()
                .dni(dniToRegister)
                .firstName(request.getNombre())
                .lastName(request.getApellidos())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(finalRole)
                .build();

        guestRepository.save(newGuest);

        String token = jwtService.generateToken(newGuest.getDni());

        return AuthResponse.builder()
                .token(token)
                .role(finalRole)
                .nombre(newGuest.getFirstName())
                .dni(newGuest.getDni())
                .build();
    }
}
