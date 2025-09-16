package com.feeling.domain.dto.user;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO para sugerencias de usuarios sin información sensible como número de teléfono
 */
public record UserSuggestionResponseDTO(
        UserPublicStatusDTO status,
        UserSuggestionProfileDTO profile
) {

    /**
     * Perfil para sugerencias sin número de teléfono
     */
    public record UserSuggestionProfileDTO(
            String name,
            String lastName,
            String email,
            LocalDate dateOfBirth,
            Integer age,
            String document,
            String country,
            String city,
            String department,
            String locality,
            String description,
            List<String> images,
            String mainImage,
            String categoryInterest,
            String gender,
            List<String> tags,
            // Campos de preferencias que el frontend espera
            Integer agePreferenceMin,
            Integer agePreferenceMax,
            Integer locationPreferenceRadius,
            // Campos específicos para SPIRIT
            String church,
            String customChurch
    ) {
    }
}