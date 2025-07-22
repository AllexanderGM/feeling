package com.feeling.domain.dto.user;

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