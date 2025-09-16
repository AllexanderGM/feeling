package com.feeling.domain.dto.user;

/**
 * DTO para actualización de configuración de notificaciones del usuario
 * Phase 2.2: Validation DTOs Creation - Notification Settings
 */
public record UserNotificationUpdateDTO(

        Boolean notificationsEmailEnabled,
        Boolean notificationsPhoneEnabled,
        Boolean notificationsMatchesEnabled,
        Boolean notificationsEventsEnabled,
        Boolean notificationsLoginEnabled,
        Boolean notificationsPaymentsEnabled

) {}