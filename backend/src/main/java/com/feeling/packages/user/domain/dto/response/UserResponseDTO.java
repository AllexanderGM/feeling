package com.feeling.packages.user.domain.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.feeling.packages.auth.domain.dto.response.AuthProviderInfoDTO;
import com.feeling.packages.auth.domain.dto.response.UserProfileDataDTO;
import com.feeling.packages.auth.domain.dto.response.UserStatusDTO;
import com.feeling.packages.user.domain.dto.UserAccountStatusDTO;
import com.feeling.packages.user.domain.dto.UserMatchesDTO;
import com.feeling.packages.user.domain.dto.mapper.UserDTOMapper;
import com.feeling.packages.user.domain.dto.response.profile.UserMetricsResponseDTO;
import com.feeling.packages.user.domain.dto.response.profile.UserNotificationDTO;
import com.feeling.packages.user.domain.dto.response.profile.UserPrivacyDTO;
import com.feeling.packages.user.infrastructure.entities.User;


/**
 * DTO de respuesta configurable para usuario
 */
public record UserResponseDTO(

    UserStatusDTO status,
    UserProfileDataDTO profile,

    // Secciones opcionales (null si no se requieren en el contexto)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserPrivacyDTO privacy,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserMetricsResponseDTO metrics,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserMatchesDTO matches,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    AuthProviderInfoDTO auth,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserAccountStatusDTO account,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserNotificationDTO notifications

) {

    // ========================================
    // FACTORY METHODS PARA DIFERENTES VISTAS
    // ========================================

    /**
     * Vista pública: solo información básica (sin datos sensibles)
     * Reemplaza UserPublicResponseDTO
     */
    public static UserResponseDTO publicView(User user) {
        return new UserResponseDTO(
            UserDTOMapper.toUserStatusDTO(user),
            UserDTOMapper.toUserProfileDataDTO(user),
            null, null, null, null, null, null
        );
    }

    /**
     * Vista estándar: incluye información de perfil y métricas básicas
     * Reemplaza UserStandardResponseDTO
     */
    public static UserResponseDTO standardView(User user) {
        return new UserResponseDTO(
            UserDTOMapper.toUserStatusDTO(user),
            UserDTOMapper.toUserProfileDataDTO(user),
            null,
            UserDTOMapper.toUserMetricsDTO(user),
            null, null, null, null
        );
    }

    /**
     * Vista extendida: incluye privacidad, métricas y matches
     * Reemplaza UserExtendedResponseDTO
     */
    public static UserResponseDTO extendedView(User user) {
        return new UserResponseDTO(
            UserDTOMapper.toUserStatusDTO(user),
            UserDTOMapper.toUserProfileDataDTO(user),
            UserDTOMapper.toUserPrivacyDTO(user),
            UserDTOMapper.toUserMetricsDTO(user),
            UserDTOMapper.toUserMatchesDTO(user),
            null, null,
            UserDTOMapper.toUserNotificationDTO(user)
        );
    }

    /**
     * Vista completa: todos los datos incluyendo admin y auth
     * Para administradores o el propio usuario
     */
    public static UserResponseDTO fullView(User user) {
        return new UserResponseDTO(
            UserDTOMapper.toUserStatusDTO(user),
            UserDTOMapper.toUserProfileDataDTO(user),
            UserDTOMapper.toUserPrivacyDTO(user),
            UserDTOMapper.toUserMetricsDTO(user),
            UserDTOMapper.toUserMatchesDTO(user),
            UserDTOMapper.toAuthProviderInfoDTO(user),
            UserDTOMapper.toUserAccountStatusDTO(user),
            UserDTOMapper.toUserNotificationDTO(user)
        );
    }

    /**
     * Vista de sugerencia: optimizada para el endpoint de sugerencias
     * Reemplaza UserSuggestionResponseDTO con datos similares pero sin teléfono
     */
    public static UserResponseDTO suggestionView(User user) {
        return new UserResponseDTO(
            UserDTOMapper.toUserPublicStatusDTO(user),
            UserDTOMapper.toUserProfileDataDTO(user),
            null, null, null, null, null, null
        );
    }

    // ========================================
    // FACTORY METHODS DE CONVENIENCIA
    // ========================================

    /**
     * Constructor desde User entity con vista completa
     * Mantiene compatibilidad con constructor anterior
     */
    public UserResponseDTO(User user) {
        this(
            UserDTOMapper.toUserStatusDTO(user),
            UserDTOMapper.toUserProfileDataDTO(user),
            UserDTOMapper.toUserPrivacyDTO(user),
            UserDTOMapper.toUserMetricsDTO(user),
            UserDTOMapper.toUserMatchesDTO(user),
            UserDTOMapper.toAuthProviderInfoDTO(user),
            UserDTOMapper.toUserAccountStatusDTO(user),
            UserDTOMapper.toUserNotificationDTO(user)
        );
    }

    // ========================================
    // MÉTODOS DE CONVENIENCIA
    // ========================================

    /**
     * Obtiene el ID del usuario desde el complaintStatus
     */
    public Long id() {
        return status != null ? status.id() : null;
    }
}
