package com.feeling.domain.dto.user;

import com.feeling.domain.dto.validation.ValidationGroups;
import jakarta.validation.constraints.*;

/**
 * DTO para actualización de preferencias de matching del usuario
 * Phase 2.2: Validation DTOs Creation - Preferences
 */
public record UserPreferencesUpdateDTO(

        @NotBlank(message = "La categoría de interés es obligatoria", groups = {ValidationGroups.UpdatePreferences.class})
        String categoryInterest,

        @Min(value = 18, message = "La edad mínima de preferencia debe ser al menos 18")
        @Max(value = 100, message = "La edad mínima de preferencia no puede superar 100")
        Integer agePreferenceMin,

        @Min(value = 18, message = "La edad máxima de preferencia debe ser al menos 18")
        @Max(value = 100, message = "La edad máxima de preferencia no puede superar 100")
        Integer agePreferenceMax,

        @Min(value = 1, message = "El radio de preferencia debe ser al menos 1 km")
        @Max(value = 1000, message = "El radio de preferencia no puede superar 1000 km")
        Integer locationPreferenceRadius

) {

    /**
     * Validación cruzada: agePreferenceMax debe ser mayor o igual que agePreferenceMin
     */
    @AssertTrue(message = "La edad máxima debe ser mayor o igual que la mínima")
    public boolean isAgeRangeValid() {
        if (agePreferenceMin == null || agePreferenceMax == null) {
            return true;
        }
        return agePreferenceMax >= agePreferenceMin;
    }
}