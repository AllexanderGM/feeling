package com.feeling.domain.dto.user;

/**
 * DTO para actualización de configuración de privacidad del usuario
 * Phase 2.2: Validation DTOs Creation - Privacy Settings
 */
public record UserPrivacyUpdateDTO(

        Boolean publicAccount,
        Boolean searchVisibility,
        Boolean locationPublic,
        Boolean showAge,
        Boolean showLocation,
        Boolean showPhone,
        Boolean showMeInSearch

) {}