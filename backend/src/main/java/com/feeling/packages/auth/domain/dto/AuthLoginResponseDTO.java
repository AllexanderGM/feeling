package com.feeling.packages.auth.domain.dto;

import com.feeling.packages.user.domain.dto.*;
import com.feeling.packages.auth.domain.dto.AuthProviderInfoDTO;

public record AuthLoginResponseDTO(
        TokenPairDTO tokens,
        UserStatusDTO status,
        UserProfileDataDTO profile,
        UserPrivacyDTO privacy,
        UserNotificationDTO notifications,
        UserMetricsDTO metrics,
        UserMatchesDTO matches,
        AuthProviderInfoDTO auth,
        UserAccountStatusDTO account
) {

    /**
     * Constructor de conveniencia para mantener compatibilidad
     */
    public AuthLoginResponseDTO(String accessToken, String refreshToken,
                               UserStatusDTO status, UserProfileDataDTO profile,
                               UserPrivacyDTO privacy, UserNotificationDTO notifications,
                               UserMetricsDTO metrics, UserMatchesDTO matches,
                               AuthProviderInfoDTO auth, UserAccountStatusDTO account) {
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