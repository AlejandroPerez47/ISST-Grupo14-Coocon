package com.touristcocoon.service;

import com.touristcocoon.domain.Huesped;
import com.touristcocoon.domain.Reserva;
import com.touristcocoon.repository.GuestRepository;
import com.touristcocoon.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CheckInService {

    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;

    @Transactional
    public String performDigitalCheckIn(UUID reservationId, String scannedDni, String firstName, String lastName, String email, MultipartFile dniPhoto) {
        
        // --- VALIDACIÓN ESTRICTA ---
        if (!StringUtils.hasText(scannedDni) || !StringUtils.hasText(firstName) 
            || !StringUtils.hasText(lastName) || !StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Todos los campos personales son obligatorios para hacer el check-in.");
        }
        
        if (dniPhoto == null || dniPhoto.isEmpty()) {
            throw new IllegalArgumentException("Es obligatorio subir una foto del DNI escaneado por normativa vigente.");
        }
        
        Reserva reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));

        if (!reservation.getGuestDni().equalsIgnoreCase(scannedDni)) {
            throw new IllegalArgumentException("El DNI proporcionado no coincide con la reserva.");
        }

        if (reservation.getStatus() == Reserva.EstadoReserva.CHECKIN_HECHO) {
            throw new IllegalStateException("El Check-in ya fue realizado previamente.");
        }
        
        // --- GUARDADO DE ARCHIVOS ---
        try {
            String originalFileName = StringUtils.cleanPath(dniPhoto.getOriginalFilename() != null ? dniPhoto.getOriginalFilename() : "dni.jpg");
            String storedFileName = reservationId.toString() + "_" + originalFileName;
            Path uploadPath = Paths.get("uploads");
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(storedFileName);
            Files.copy(dniPhoto.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            reservation.setDniPhotoPath(filePath.toString());
            
        } catch (Exception ex) {
            throw new IllegalStateException("Error al guardar la foto del DNI: " + ex.getMessage());
        }

        // Registrar o actualizar el huésped con los originales
        Optional<Huesped> guestOpt = guestRepository.findById(reservation.getGuestDni());
        if (guestOpt.isEmpty()) {
            Huesped newGuest = Huesped.builder()
                    .dni(reservation.getGuestDni())
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password(UUID.randomUUID().toString())
                    .role("USER")
                    .build();
            try {
                guestRepository.save(newGuest);
            } catch (Exception e) {
                // Si falla por email duplicado u otra constraint, lo propagamos limpiamente
                throw new IllegalArgumentException("No se pudo registrar al usuario. Es posible que el email introducido ya exista.");
            }
        }

        // Generar PIN único de 6 cifras
        String rawPin = String.format("%06d", new Random().nextInt(999999));
        
        reservation.setAccessPin(rawPin);
        reservation.setStatus(Reserva.EstadoReserva.CHECKIN_HECHO);
        reservationRepository.save(reservation);

        return rawPin;
    }
}
