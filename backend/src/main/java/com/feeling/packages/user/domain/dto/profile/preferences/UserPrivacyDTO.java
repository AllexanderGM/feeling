package com.feeling.packages.user.domain.dto.profile.preferences;

/**
 * DTO para configuración de privacidad del usuario
 */
public record UserPrivacyDTO(
    Boolean publicAccount,
    Boolean searchVisibility,
    Boolean locationPublic,
    Boolean showAge,
    Boolean showLocation,
    Boolean showPhone,
    Boolean showMeInSearch
) {
}
