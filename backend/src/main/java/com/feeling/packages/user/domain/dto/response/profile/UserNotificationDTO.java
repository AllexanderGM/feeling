package com.feeling.packages.user.domain.dto.response.profile;

/**
 * DTO para configuración de notificaciones del usuario
 */
public record UserNotificationDTO(
    Boolean notificationsEmailEnabled,
    Boolean notificationsPhoneEnabled,
    Boolean notificationsMatchesEnabled,
    Boolean notificationsEventsEnabled,
    Boolean notificationsLoginEnabled,
    Boolean notificationsPaymentsEnabled
) {
}
