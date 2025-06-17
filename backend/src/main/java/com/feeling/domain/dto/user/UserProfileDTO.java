package com.feeling.domain.dto.user;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record UserProfileDTO(
        @Size(max = 50, message = "El apellido no puede superar los 50 caracteres")
        String lastName,

        @Size(max = 20, message = "El documento no puede superar los 20 caracteres")
        String document,

        @Pattern(regexp = "\\d{9,15}", message = "El teléfono debe tener entre 9 y 15 dígitos")
        String phone,

        @Past(message = "La fecha de nacimiento debe ser en el pasado")
        LocalDate dateOfBirth,

        @Size(max = 100, message = "La dirección no puede superar los 100 caracteres")
        String address,

        @Size(max = 50, message = "La ciudad no puede superar los 50 caracteres")
        String city,

        @Size(max = 50, message = "El departamento no puede superar los 50 caracteres")
        String department,

        @Size(max = 50, message = "El país no puede superar los 50 caracteres")
        String country,

        List<String> image,

        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String description,

        // Para seleccionar categoría de interés (SINGLES, ROUSE, SPIRIT)
        String categoryInterest,

        // Para atributos dinámicos
        Long genderId,
        Long maritalStatusId,
        Long religionId,

        // Para tags de intereses
        List<String> tags,

        // Preferencias de matching
        Integer agePreferenceMin,
        Integer agePreferenceMax,
        Integer locationPreferenceRadius
) {
}
