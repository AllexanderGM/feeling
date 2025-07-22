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
                user.getLocationPreferenceRadius()
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

    /**
     * Convierte una entidad User a UserPublicResponseDTO (solo datos públicos)
     */
    public static UserPublicResponseDTO toUserPublicResponseDTO(User user) {
        return new UserPublicResponseDTO(
                new UserPublicResponseDTO.UserPublicStatusDTO(
                        user.isVerified(),
                        user.getProfileComplete(),
                        user.isApproved(),
                        user.getCategoryInterest() != null ?
                                user.getCategoryInterest().getCategoryInterestEnum().name() : null
                ),
                toUserProfileDataDTO(user)
        );
    }
}