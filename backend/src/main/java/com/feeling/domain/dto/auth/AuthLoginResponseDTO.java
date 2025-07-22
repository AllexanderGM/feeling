package com.feeling.domain.dto.auth;

import com.feeling.domain.dto.user.*;

public record AuthLoginResponseDTO(
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