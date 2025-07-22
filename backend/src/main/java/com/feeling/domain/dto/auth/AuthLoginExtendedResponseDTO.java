package com.feeling.domain.dto.auth;

import com.feeling.domain.dto.user.*;

/**
 * DTO de respuesta de login extendido con toda la información del usuario
 */
public record AuthLoginExtendedResponseDTO(
        String accessToken,
        String refreshToken,
        UserStatusDTO status,
        UserProfileDataDTO profile,
        UserPrivacyDTO privacy,
        UserNotificationDTO notifications,
        UserMetricsDTO metrics,
        UserAuthDTO auth,
        UserAccountStatusDTO account
) {
}