package com.feeling.domain.dto.user;

import com.feeling.domain.dto.auth.UserStatusDTO;
import com.feeling.domain.dto.auth.UserProfileDataDTO;

/**
 * DTO extendido para respuestas que incluyen datos completos del usuario
 * con información adicional de privacidad, notificaciones, métricas, auth y estado de cuenta
 */
public record UserExtendedResponseDTO(
        UserStatusDTO status,
        UserProfileDataDTO profile,
        UserPrivacyDTO privacy,
        UserNotificationDTO notifications,
        UserMetricsDTO metrics,
        UserAuthDTO auth,
        UserAccountStatusDTO account
) {
}