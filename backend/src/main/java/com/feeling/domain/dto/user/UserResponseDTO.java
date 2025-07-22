package com.feeling.domain.dto.user;

import com.feeling.domain.dto.auth.UserStatusDTO;
import com.feeling.domain.dto.auth.UserProfileDataDTO;
import com.feeling.infrastructure.entities.user.User;

/**
 * DTO de respuesta del usuario usando estructura estándar
 */
public record UserResponseDTO(
        Long id, // ID adicional para administración
        UserStatusDTO status,
        UserProfileDataDTO profile,
        UserPrivacyDTO privacy,
        UserNotificationDTO notifications,
        UserMetricsDTO metrics,
        UserAuthDTO auth,
        UserAccountStatusDTO account
) {
    
    public UserResponseDTO(User user) {
        this(
                user.getId(),
                UserDTOMapper.toUserStatusDTO(user),
                UserDTOMapper.toUserProfileDataDTO(user),
                new UserPrivacyDTO(
                        user.isPublicAccount(),
                        user.isSearchVisibility(),
                        user.isLocationPublic(),
                        user.isShowAge(),
                        user.isShowLocation(),
                        user.isShowPhone(),
                        user.isShowMeInSearch()
                ),
                new UserNotificationDTO(
                        user.isNotificationsEmailEnabled(),
                        user.isNotificationsPhoneEnabled(),
                        user.isNotificationsMatchesEnabled(),
                        user.isNotificationsEventsEnabled(),
                        user.isNotificationsLoginEnabled(),
                        user.isNotificationsPaymentsEnabled()
                ),
                new UserMetricsDTO(
                        user.getProfileViews(),
                        user.getLikesReceived(),
                        user.getMatchesCount(),
                        user.getPopularityScore()
                ),
                new UserAuthDTO(
                        user.getUserAuthProvider(),
                        user.getExternalId(),
                        user.getExternalAvatarUrl(),
                        user.getLastExternalSync()
                ),
                new UserAccountStatusDTO(
                        user.isAccountDeactivated(),
                        user.getDeactivationDate(),
                        user.getDeactivationReason()
                )
        );
    }
}
