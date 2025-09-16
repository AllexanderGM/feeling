package com.feeling.domain.dto.user;

import com.feeling.domain.dto.validation.ValidationGroups;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO de validación para operaciones de usuario con grupos de validación
 * Phase 2.2: Validation DTOs Creation
 */
public record UserValidatedDTO(

        // Campos básicos
        @NotBlank(message = "El nombre es obligatorio", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        String name,

        @NotBlank(message = "El apellido es obligatorio", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        String lastName,

        @NotBlank(message = "El email es obligatorio", groups = {ValidationGroups.CreateUser.class, ValidationGroups.Login.class})
        @Email(message = "El email debe tener un formato válido", groups = {ValidationGroups.CreateUser.class, ValidationGroups.Login.class, ValidationGroups.UpdateProfile.class})
        String email,

        @NotNull(message = "La fecha de nacimiento es obligatoria", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        @Past(message = "La fecha de nacimiento debe ser en el pasado", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        LocalDate dateOfBirth,

        // Campos de contacto
        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "El teléfono debe tener un formato válido", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        String phone,

        @Size(max = 5, message = "El código de país no puede superar 5 caracteres", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        String phoneCode,

        // Campos de ubicación
        @NotBlank(message = "El país es obligatorio", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        @Size(max = 100, message = "El país no puede superar 100 caracteres", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        String country,

        @NotBlank(message = "La ciudad es obligatoria", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        @Size(max = 100, message = "La ciudad no puede superar 100 caracteres", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        String city,

        @Size(max = 100, message = "El departamento no puede superar 100 caracteres", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        String department,

        @Size(max = 100, message = "La localidad no puede superar 100 caracteres", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        String locality,

        // Campos de perfil
        @Size(max = 500, message = "La descripción no puede superar 500 caracteres", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        String description,

        @Size(max = 10, message = "No puedes tener más de 10 imágenes", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        List<String> images,

        String mainImage,

        @NotBlank(message = "La categoría de interés es obligatoria", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdatePreferences.class})
        String categoryInterest,

        String gender,

        @Size(max = 20, message = "No puedes tener más de 20 tags", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdateProfile.class})
        List<String> tags,

        // Campos de preferencias
        @Min(value = 18, message = "La edad mínima de preferencia debe ser al menos 18", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdatePreferences.class})
        @Max(value = 100, message = "La edad mínima de preferencia no puede superar 100", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdatePreferences.class})
        Integer agePreferenceMin,

        @Min(value = 18, message = "La edad máxima de preferencia debe ser al menos 18", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdatePreferences.class})
        @Max(value = 100, message = "La edad máxima de preferencia no puede superar 100", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdatePreferences.class})
        Integer agePreferenceMax,

        @Min(value = 1, message = "El radio de preferencia debe ser al menos 1 km", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdatePreferences.class})
        @Max(value = 1000, message = "El radio de preferencia no puede superar 1000 km", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdatePreferences.class})
        Integer locationPreferenceRadius,

        // Campos específicos para SPIRIT
        String church,
        String customChurch,

        // Campos de privacidad (solo para updates de privacidad)
        Boolean publicAccount,
        Boolean searchVisibility,
        Boolean locationPublic,
        Boolean showAge,
        Boolean showLocation,
        Boolean showPhone,
        Boolean showMeInSearch,

        // Campos de notificaciones (solo para updates de notificaciones)
        Boolean notificationsEmailEnabled,
        Boolean notificationsPhoneEnabled,
        Boolean notificationsMatchesEnabled,
        Boolean notificationsEventsEnabled,
        Boolean notificationsLoginEnabled,
        Boolean notificationsPaymentsEnabled,

        // Campos de admin (solo para operaciones de admin)
        @NotNull(message = "El estado de verificación es obligatorio", groups = {ValidationGroups.AdminOperation.class})
        Boolean verified,

        @NotNull(message = "El estado de aprobación es obligatorio", groups = {ValidationGroups.AdminOperation.class})
        String approvalStatus,

        @NotNull(message = "El rol es obligatorio", groups = {ValidationGroups.AdminOperation.class})
        String role,

        Boolean accountDeactivated,
        String deactivationReason

) {

    /**
     * Validación cruzada: agePreferenceMax debe ser mayor que agePreferenceMin
     */
    @AssertTrue(message = "La edad máxima debe ser mayor que la mínima", groups = {ValidationGroups.CreateUser.class, ValidationGroups.UpdatePreferences.class})
    public boolean isAgePreferenceValid() {
        if (agePreferenceMin == null || agePreferenceMax == null) {
            return true; // Las validaciones @NotNull se encargan de esto
        }
        return agePreferenceMax >= agePreferenceMin;
    }

    /**
     * Validación cruzada: si showPhone es true, el teléfono debe estar presente
     */
    @AssertTrue(message = "Si eliges mostrar el teléfono, debes proporcionarlo", groups = {ValidationGroups.UpdatePrivacy.class, ValidationGroups.CreateUser.class})
    public boolean isPhoneVisibilityValid() {
        if (showPhone == null || !showPhone) {
            return true; // Si no muestra teléfono, no importa si lo tiene
        }
        return phone != null && !phone.trim().isEmpty();
    }
}