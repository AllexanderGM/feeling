package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.response.AuthLoginEssentialResponseDTO;
import com.feeling.packages.auth.domain.dto.response.AuthLoginResponseDTO;
import com.feeling.packages.auth.domain.dto.response.AuthProviderInfoDTO;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserAccountStatusDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserDataDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserMatchesDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserStatusDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserNotificationDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserPrivacyDTO;
import com.feeling.packages.user.domain.dto.profile.response.UserEssentialDTO;
import com.feeling.packages.user.domain.dto.profile.response.UserResponseDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.factory.Mappers;

/**
 * Utilidad para mapear entidades User a DTOs estandarizados
 */
public class UserDTOMapper {

    private static final UserDataMapper USER_DATA_MAPPER = Mappers.getMapper(UserDataMapper.class);
    private static final UserStatusMapper USER_STATUS_MAPPER = Mappers.getMapper(UserStatusMapper.class);
    private static final UserPrivacyMapper USER_PRIVACY_MAPPER = Mappers.getMapper(UserPrivacyMapper.class);
    private static final UserNotificationMapper USER_NOTIFICATION_MAPPER = Mappers.getMapper(UserNotificationMapper.class);
    private static final UserMatchesMapper USER_MATCHES_MAPPER = Mappers.getMapper(UserMatchesMapper.class);
    private static final UserMetricsMapper USER_METRICS_MAPPER = Mappers.getMapper(UserMetricsMapper.class);
    private static final UserAuthMapper USER_AUTH_MAPPER = Mappers.getMapper(UserAuthMapper.class);
    private static final UserAccountStatusMapper USER_ACCOUNT_STATUS_MAPPER = Mappers.getMapper(UserAccountStatusMapper.class);
    private static final UserEssentialMapper USER_ESSENTIAL_MAPPER = Mappers.getMapper(UserEssentialMapper.class);
    private static final UserResponseMapper USER_RESPONSE_MAPPER = Mappers.getMapper(UserResponseMapper.class);

    /**
     * Convierte una entidad User a MatchStatusDTO
     */
    public static UserStatusDTO toUserStatusDTO(User user) {
        return USER_STATUS_MAPPER.toStatus(user);
    }

    /**
     * Convierte una entidad User a UserDataDTO
     */
    public static UserDataDTO toUserProfileDataDTO(User user) {
        return USER_DATA_MAPPER.toUserDataDTO(user);
    }

    /**
     * Convierte una entidad User a UserResponseDTO (standard level)
     */
    public static UserResponseDTO toUserStandardResponseDTO(User user) {
        return USER_RESPONSE_MAPPER.toStandardResponse(user);
    }

    /**
     * Convierte una entidad User a UserResponseDTO (extended level)
     */
    public static UserResponseDTO toUserExtendedResponseDTO(User user) {
        return USER_RESPONSE_MAPPER.toExtendedResponse(user);
    }

    /**
     * Convierte una entidad User a UserResponseDTO (con datos adicionales y métricas de matches)
     */
    public static UserResponseDTO toUserExtendedResponseDTO(User user, UserMatchesDTO matches) {
        return USER_RESPONSE_MAPPER.toExtendedResponse(user, matches);
    }

    /**
     * Convierte una entidad User a UserResponseDTO (public level)
     */
    public static UserResponseDTO toUserPublicResponseDTO(User user) {
        return USER_RESPONSE_MAPPER.toPublicResponse(user);
    }

    /**
     * Convierte una entidad User a UserResponseDTO (full level)
     */
    public static UserResponseDTO toUserFullResponseDTO(User user) {
        return USER_RESPONSE_MAPPER.toFullResponse(user);
    }

    /**
     * Convierte una entidad User a UserResponseDTO (suggestion level)
     */
    public static UserResponseDTO toUserSuggestionResponseDTO(User user) {
        return USER_RESPONSE_MAPPER.toSuggestionResponse(user);
    }


    /**
     * Convierte una entidad User a AuthLoginResponseDTO (para tests)
     */
    public static AuthLoginResponseDTO toAuthLoginResponseDTO(User user, String accessToken, String refreshToken) {
        return new AuthLoginResponseDTO(
            accessToken,
            refreshToken,
            toUserStatusDTO(user),
            toUserProfileDataDTO(user),
            toUserPrivacyDTO(user),
            toUserNotificationDTO(user),
            toUserMetricsDTO(user),
            toUserMatchesDTO(user),
            toAuthProviderInfoDTO(user),
            toUserAccountStatusDTO(user)
        );
    }

    /**
     * Convierte una entidad User a UserEssentialDTO
     */
    public static UserEssentialDTO toUserEssentialDTO(User user) {
        return USER_ESSENTIAL_MAPPER.toEssential(user);
    }

    /**
     * Convierte una entidad User a AuthLoginEssentialResponseDTO
     */
    public static AuthLoginEssentialResponseDTO toAuthLoginEssentialResponseDTO(User user, String accessToken, String refreshToken) {
        return new AuthLoginEssentialResponseDTO(
            accessToken,
            refreshToken,
            toUserEssentialDTO(user)
        );
    }

    /**
     * Convierte una entidad User a UserNotificationDTO
     */
    public static UserNotificationDTO toUserNotificationDTO(User user) {
        return USER_NOTIFICATION_MAPPER.toNotifications(user);
    }

    /**
     * Convierte una entidad User a UserPrivacyDTO
     */
    public static UserPrivacyDTO toUserPrivacyDTO(User user) {
        return USER_PRIVACY_MAPPER.toPrivacy(user);
    }

    /**
     * Convierte una entidad User a UserPerformanceMetricsDTO
     */
    public static UserPerformanceMetricsDTO toUserMetricsDTO(User user) {
        return USER_METRICS_MAPPER.toMetrics(user);
    }

    /**
     * Convierte una entidad User a UserMatchesDTO
     */
    public static UserMatchesDTO toUserMatchesDTO(User user) {
        return USER_MATCHES_MAPPER.toMatches(user);
    }

    /**
     * Convierte una entidad User a AuthProviderInfoDTO
     */
    public static AuthProviderInfoDTO toAuthProviderInfoDTO(User user) {
        return USER_AUTH_MAPPER.toAuthProviderInfo(user);
    }

    /**
     * Convierte una entidad User a UserAccountStatusDTO
     */
    public static UserAccountStatusDTO toUserAccountStatusDTO(User user) {
        return USER_ACCOUNT_STATUS_MAPPER.toAccountStatus(user);
    }

    /**
     * Convierte una entidad User a MatchStatusDTO público (sin datos sensibles)
     */
    public static UserStatusDTO toUserPublicStatusDTO(User user) {
        return USER_STATUS_MAPPER.toPublicStatus(user);
    }
}
