package com.feeling.domain.dto.user;

import com.feeling.domain.dto.auth.UserStatusDTO;
import com.feeling.domain.dto.auth.UserProfileDataDTO;
import com.feeling.infrastructure.entities.user.User;

/**
 * DTO de respuesta del usuario para administración (incluye ID)
 * Extiende UserExtendedResponseDTO añadiendo ID para funciones admin
 */
public record UserResponseDTO(
        Long id, // ID adicional para administración
        UserStatusDTO status,
        UserProfileDataDTO profile,
        UserPrivacyDTO privacy,
        UserNotificationDTO notifications,
        UserMetricsDTO metrics,
        UserMatchesDTO matches, // Añadido para completud
        UserAuthDTO auth,
        UserAccountStatusDTO account
) {

    /**
     * Constructor desde UserExtendedResponseDTO + ID
     */
    public UserResponseDTO(Long id, UserExtendedResponseDTO extended) {
        this(id, extended.status(), extended.profile(), extended.privacy(),
             extended.notifications(), extended.metrics(), extended.matches(), extended.auth(), extended.account());
    }
    
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
                        user.getPopularityScore(),
                        user.getProfileCompletenessPercentage()
                ),
                new UserMatchesDTO(
                        user.getAvailableAttempts(),
                        0, // todayMatches - TODO: implementar lógica
                        user.getMatchesCount().intValue(),
                        10, // maxDailyAttempts - TODO: obtener de configuración
                        0L, // pendingSent
                        0L, // pendingReceived
                        0L, // accepted
                        0L  // favorites
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
