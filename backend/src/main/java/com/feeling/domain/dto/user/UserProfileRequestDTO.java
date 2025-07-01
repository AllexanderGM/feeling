package com.feeling.domain.dto.user;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record UserProfileRequestDTO(
        // ========================================
        // DATOS PERSONALES BÁSICOS
        // ========================================
        @NotBlank(message = "El documento es obligatorio")
        @Size(max = 20, message = "El documento no puede superar los 20 caracteres")
        String document,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = "^\\+?\\d{1,4}\\d{9,15}$", message = "El teléfono debe incluir código de país y tener entre 9 y 15 dígitos")
        String phone,

        @NotNull(message = "La fecha de nacimiento es obligatoria")
        @Past(message = "La fecha de nacimiento debe ser en el pasado")
        LocalDate dateOfBirth,

        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String description,

        // ========================================
        // UBICACIÓN GEOGRÁFICA
        // ========================================

        @NotBlank(message = "El país es obligatorio")
        @Size(max = 50, message = "El país no puede superar los 50 caracteres")
        String country,

        @NotBlank(message = "La ciudad es obligatoria")
        @Size(max = 50, message = "La ciudad no puede superar los 50 caracteres")
        String city,

        @Size(max = 50, message = "El departamento no puede superar los 50 caracteres")
        String department,

        @Size(max = 50, message = "La localidad no puede superar los 50 caracteres")
        String locality,

        // ========================================
        // CARACTERÍSTICAS
        // ========================================

        // Para seleccionar categoría de interés (ESSENCE, ROUSE, SPIRIT)
        @NotNull(message = "La categoría de interés es obligatoria")
        String categoryInterest,

        Long genderId,
        Long maritalStatusId,
        Integer height,
        Long eyeColorId,
        Long hairColorId,
        Long bodyTypeId,
        Long educationId,
        @Size(max = 100, message = "La profesión no puede superar los 100 caracteres")
        String profession,
        // Para tags de intereses
        List<String> tags,

        // ========================================
        // DATOS PARA SPIRIT
        // ========================================
        Long religionId,
        String spiritualMoments,
        String spiritualPractices,

        // =========================================
        // DATOS PARA ROUSE
        // =========================================
        Long sexualRoleId,
        Long relationshipId,

        // Preferencias de matching
        Integer agePreferenceMin,
        Integer agePreferenceMax,
        Integer locationPreferenceRadius,
        Boolean allowNotifications
) {
}
