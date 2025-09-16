package com.feeling.domain.dto.auth;

import com.feeling.domain.dto.user.*;

public record AuthLoginResponseDTO(
        TokenPairDTO tokens,
        UserStatusDTO status,
        UserProfileDataDTO profile,
        UserPrivacyDTO privacy,
        UserNotificationDTO notifications,
        UserMetricsDTO metrics,
        UserMatchesDTO matches,
        UserAuthDTO auth,
        UserAccountStatusDTO account
) {

    /**
     * Constructor de conveniencia para mantener compatibilidad
     */
    public AuthLoginResponseDTO(String accessToken, String refreshToken,
                               UserStatusDTO status, UserProfileDataDTO profile,
                               UserPrivacyDTO privacy, UserNotificationDTO notifications,
                               UserMetricsDTO metrics, UserMatchesDTO matches,
                               UserAuthDTO auth, UserAccountStatusDTO account) {
        this(new TokenPairDTO(accessToken, refreshToken), status, profile, privacy,
             notifications, metrics, matches, auth, account);
    }

    /**
     * Getters para compatibilidad hacia atrás
     */
    public String accessToken() {
        return tokens.accessToken();
    }

    public String refreshToken() {
        return tokens.refreshToken();
    }
}