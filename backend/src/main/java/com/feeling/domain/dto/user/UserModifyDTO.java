package com.feeling.domain.dto.user;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record UserModifyDTO(
        // ========================================
        // DATOS BÁSICOS
        // ========================================
        @Size(max = 50, message = "El nombre no puede superar los 50 caracteres")
        String name,

        @Size(max = 50, message = "El apellido no puede superar los 50 caracteres")
        String lastName,

        @Email(message = "El correo debe ser válido")
        String email,

        @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
        String password,

        // ========================================
        // DATOS PERSONALES
        // ========================================
        @Size(max = 20, message = "El documento no puede superar los 20 caracteres")
        String document,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = "^\\+?\\d{1,4}\\d{9,15}$", message = "El teléfono debe incluir código de país y tener entre 9 y 15 dígitos")
        String phone,

        @Past(message = "La fecha de nacimiento debe ser en el pasado")
        LocalDate dateOfBirth,

        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String description,

        // ========================================
        // UBICACIÓN
        // ========================================
        @Size(max = 50, message = "El país no puede superar los 50 caracteres")
        String country,

        @Size(max = 50, message = "El departamento no puede superar los 50 caracteres")
        String department,

        @Size(max = 50, message = "La ciudad no puede superar los 50 caracteres")
        String city,

        @Size(max = 50, message = "La localidad no puede superar los 50 caracteres")
        String locality,

        @Size(max = 100, message = "La dirección no puede superar los 100 caracteres")
        String address,

        // ========================================
        // CARACTERÍSTICAS Y ATRIBUTOS
        // ========================================
        String categoryInterest, // SINGLES, ROUSE, SPIRIT

        // IDs de atributos dinámicos
        Long genderId,
        Long maritalStatusId,
        Long eyeColorId,
        Long hairColorId,
        Long bodyTypeId,
        Long religionId,
        Long sexualRoleId,      // Para ROUSE
        Long relationshipTypeId, // Para ROUSE

        // ========================================
        // DATOS COMPLEMENTARIOS
        // ========================================
        String profession,
        String education,
        Integer height, // Altura en centímetros

        // Información religiosa específica (Para SPIRIT)
        String church,
        String spiritualMoments,
        String spiritualPractices,

        // ========================================
        // PREFERENCIAS DE MATCHING
        // ========================================
        Integer agePreferenceMin,
        Integer agePreferenceMax,
        Integer locationPreferenceRadius,

        // ========================================
        // CONFIGURACIÓN DE PRIVACIDAD
        // ========================================
        Boolean showAge,
        Boolean showLocation,
        Boolean showPhone,
        Boolean showMeInSearch,
        Boolean allowNotifications,

        // ========================================
        // TAGS E INTERESES
        // ========================================
        List<String> tags,

        // ========================================
        // IMÁGENES (solo URLs para actualización)
        // ========================================
        List<String> imageUrls, // Para recibir URLs de imágenes ya subidas

        // ========================================
        // ROLE y APROBACIÓN (para administradores)
        // ========================================
        String role,
        
        Boolean approved,

        // ========================================
        // CONFIGURACIÓN DE PRIVACIDAD EXTENDIDA
        // ========================================
        Boolean publicAccount,
        Boolean searchVisibility,
        Boolean locationPublic,

        // ========================================
        // CONFIGURACIÓN DE NOTIFICACIONES
        // ========================================
        Boolean notificationsEmailEnabled,
        Boolean notificationsPhoneEnabled,
        Boolean notificationsMatchesEnabled,
        Boolean notificationsEventsEnabled,
        Boolean notificationsLoginEnabled,
        Boolean notificationsPaymentsEnabled,

        // ========================================
        // GESTIÓN DE CUENTA
        // ========================================
        Boolean accountDeactivated,
        String deactivationReason
) {

    // Método de compatibilidad para el birthdate
    public CharSequence birthdate() {
        return dateOfBirth != null ? dateOfBirth.toString() : null;
    }

    // Método para validar datos básicos
    public boolean hasBasicData() {
        return name != null && lastName != null && email != null;
    }

    // Método para validar datos de perfil completo
    public boolean hasProfileCompleteData() {
        return hasBasicData() &&
                dateOfBirth != null &&
                genderId != null &&
                categoryInterest != null &&
                description != null;
    }

    // Método para verificar si hay cambios de ubicación
    public boolean hasLocationChanges() {
        return country != null || department != null || city != null || locality != null;
    }

    // Método para verificar si hay cambios de preferencias
    public boolean hasPreferenceChanges() {
        return agePreferenceMin != null ||
                agePreferenceMax != null ||
                locationPreferenceRadius != null;
    }

    // Método para verificar si hay cambios de privacidad
    public boolean hasPrivacyChanges() {
        return showAge != null ||
                showLocation != null ||
                showPhone != null ||
                showMeInSearch != null ||
                allowNotifications != null;
    }

    // Método para verificar si hay datos específicos de SPIRIT
    public boolean hasSpiritualData() {
        return church != null ||
                spiritualMoments != null ||
                spiritualPractices != null ||
                religionId != null;
    }

    // Método para verificar si hay datos específicos de ROUSE
    public boolean hasRouserData() {
        return sexualRoleId != null || relationshipTypeId != null;
    }

    // Método para verificar si hay cambios de configuración de privacidad extendida
    public boolean hasExtendedPrivacyChanges() {
        return publicAccount != null ||
                searchVisibility != null ||
                locationPublic != null;
    }

    // Método para verificar si hay cambios de configuración de notificaciones
    public boolean hasNotificationChanges() {
        return notificationsEmailEnabled != null ||
                notificationsPhoneEnabled != null ||
                notificationsMatchesEnabled != null ||
                notificationsEventsEnabled != null ||
                notificationsLoginEnabled != null ||
                notificationsPaymentsEnabled != null;
    }

    // Método para verificar si hay cambios de estado de cuenta
    public boolean hasAccountStatusChanges() {
        return accountDeactivated != null ||
                deactivationReason != null;
    }
}