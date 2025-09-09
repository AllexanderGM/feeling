package com.feeling.domain.dto.user;

import com.feeling.domain.dto.auth.UserStatusDTO;
import com.feeling.domain.dto.auth.UserProfileDataDTO;

/**
 * DTO extendido para respuestas que incluyen datos completos del usuario
 * con información adicional de privacidad, notificaciones, métricas, auth, estado de cuenta y matches
 */
public record UserExtendedResponseDTO(
        UserStatusDTO status,
        UserProfileDataDTO profile,
        UserPrivacyDTO privacy,
        UserNotificationDTO notifications,
        UserMetricsDTO metrics,
        UserMatchesDTO matches,
        UserAuthDTO auth,
        UserAccountStatusDTO account
) {
}