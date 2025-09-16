package com.feeling.domain.dto.user;

import com.feeling.domain.dto.auth.UserProfileDataDTO;
import com.feeling.domain.dto.auth.UserStatusDTO;
import com.feeling.infrastructure.entities.user.User;

/**
 * Utilidad para mapear entidades User a DTOs estandarizados
 */
public class UserDTOMapper {

    /**
     * Convierte una entidad User a UserStatusDTO
     */
    public static UserStatusDTO toUserStatusDTO(User user) {
        return new UserStatusDTO(
                user.isVerified(),
                user.getProfileComplete(),
                user.isApproved(),
                user.getApprovalStatus().name(),
                user.getUserRole().getUserRoleList().name(),
                user.getAvailableAttempts(),
                user.getCreatedAt(),
                user.getLastActive()
        );
    }

    /**
     * Convierte una entidad User a UserProfileDataDTO
     */
    public static UserProfileDataDTO toUserProfileDataDTO(User user) {
        return new UserProfileDataDTO(
                user.getName(),
                user.getLastName(),
                user.getEmail(),
                user.getDateOfBirth(),
                user.getAge(),
                user.getDocument(),
                user.getPhone(),
                user.getPhoneCode(),
                user.getCountry(),
                user.getCity(),
                user.getDepartment(),
                user.getLocality(),
                user.getDescription(),
                user.getImages(),
                user.getMainImage(),
                user.getCategoryInterest() != null ?
                        user.getCategoryInterest().getCategoryInterestEnum().name() : null,
                user.getGender() != null ? user.getGender().getName() : null,
                user.getTagNames(),
                // Campos de preferencias
                user.getAgePreferenceMin(),
                user.getAgePreferenceMax(),
                user.getLocationPreferenceRadius(),
                // Campos específicos para SPIRIT
                user.getChurch() != null ? user.getChurch().getName() : null,
                user.getCustomChurch()
        );
    }

    /**
     * Convierte una entidad User a UserStandardResponseDTO
     */
    public static UserStandardResponseDTO toUserStandardResponseDTO(User user) {
        return new UserStandardResponseDTO(
                toUserStatusDTO(user),
                toUserProfileDataDTO(user)
        );
    }

    /**
     * Convierte una entidad User a UserExtendedResponseDTO (con datos adicionales)
     */
    public static UserExtendedResponseDTO toUserExtendedResponseDTO(User user) {
        return new UserExtendedResponseDTO(
                toUserStatusDTO(user),
                toUserProfileDataDTO(user),
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
                        0, // todayMatches - TODO: implementar lógica para obtener matches de hoy
                        user.getMatchesCount().intValue(), // Convertir Long a Integer
                        10, // maxDailyAttempts - TODO: obtener de configuración
                        0L, // pendingSent - se calculará con servicios
                        0L, // pendingReceived - se calculará con servicios
                        0L, // accepted - se calculará con servicios
                        0L  // favorites - se calculará con servicios
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

    /**
     * Convierte una entidad User a UserExtendedResponseDTO (con datos adicionales y métricas de matches)
     */
    public static UserExtendedResponseDTO toUserExtendedResponseDTO(User user, UserMatchesDTO matches) {
        return new UserExtendedResponseDTO(
                toUserStatusDTO(user),
                toUserProfileDataDTO(user),
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
                matches,
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

    /**
     * Convierte una entidad User a UserPublicStatusDTO
     */
    public static UserPublicStatusDTO toUserPublicStatusDTO(User user) {
        return new UserPublicStatusDTO(
                user.isVerified(),
                user.getProfileComplete(),
                user.isApproved(),
                user.getApprovalStatus().name(),
                user.getCategoryInterest() != null ?
                        user.getCategoryInterest().getCategoryInterestEnum().name() : null
        );
    }

    /**
     * Convierte una entidad User a UserPublicResponseDTO (solo datos públicos)
     */
    public static UserPublicResponseDTO toUserPublicResponseDTO(User user) {
        return new UserPublicResponseDTO(
                toUserPublicStatusDTO(user),
                toUserProfileDataDTO(user)
        );
    }

    /**
     * Convierte una entidad User a UserSuggestionResponseDTO (sin número de teléfono)
     */
    public static UserSuggestionResponseDTO toUserSuggestionResponseDTO(User user) {
        return new UserSuggestionResponseDTO(
                toUserPublicStatusDTO(user),
                new UserSuggestionResponseDTO.UserSuggestionProfileDTO(
                        user.getName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getDateOfBirth(),
                        user.getAge(),
                        user.getDocument(),
                        user.getCountry(),
                        user.getCity(),
                        user.getDepartment(),
                        user.getLocality(),
                        user.getDescription(),
                        user.getImages(),
                        user.getMainImage(),
                        user.getCategoryInterest() != null ?
                                user.getCategoryInterest().getCategoryInterestEnum().name() : null,
                        user.getGender() != null ? user.getGender().getName() : null,
                        user.getTagNames(),
                        // Campos de preferencias
                        user.getAgePreferenceMin(),
                        user.getAgePreferenceMax(),
                        user.getLocationPreferenceRadius(),
                        // Campos específicos para SPIRIT
                        user.getChurch() != null ? user.getChurch().getName() : null,
                        user.getCustomChurch()
                )
        );
    }

    /**
     * Convierte una entidad User a AuthLoginResponseDTO (para tests)
     */
    public static com.feeling.domain.dto.auth.AuthLoginResponseDTO toAuthLoginResponseDTO(User user, String accessToken, String refreshToken) {
        return new com.feeling.domain.dto.auth.AuthLoginResponseDTO(
                accessToken,
                refreshToken,
                toUserStatusDTO(user),
                toUserProfileDataDTO(user),
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