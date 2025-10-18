package com.feeling.packages.user.domain.dto.profile.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.feeling.packages.auth.domain.dto.response.AuthProviderInfoDTO;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.domain.dto.mapper.UserDTOMapper;
import com.feeling.packages.user.domain.dto.profile.core.UserAccountStatusDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserDataDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserMatchesDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserStatusDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserNotificationDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserPrivacyDTO;
import com.feeling.packages.user.infrastructure.entities.User;


/**
 * DTO de respuesta configurable para usuario
 */
public record UserResponseDTO(

    UserStatusDTO status,
    UserDataDTO profile,

    // Secciones opcionales (null si no se requieren en el contexto)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserPrivacyDTO privacy,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserPerformanceMetricsDTO metrics,

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
        return UserDTOMapper.toUserPublicResponseDTO(user);
    }

    /**
     * Vista estándar: incluye información de perfil y métricas básicas
     * Reemplaza UserStandardResponseDTO
     */
    public static UserResponseDTO standardView(User user) {
        return UserDTOMapper.toUserStandardResponseDTO(user);
    }

    /**
     * Vista extendida: incluye privacidad, métricas y matches
     * Reemplaza UserExtendedResponseDTO
     */
    public static UserResponseDTO extendedView(User user) {
        return UserDTOMapper.toUserExtendedResponseDTO(user);
    }

    /**
     * Vista completa: todos los datos incluyendo admin y auth
     * Para administradores o el propio usuario
     */
    public static UserResponseDTO fullView(User user) {
        return UserDTOMapper.toUserFullResponseDTO(user);
    }

    /**
     * Vista de sugerencia: optimizada para el endpoint de sugerencias
     * Reemplaza UserSuggestionResponseDTO con datos similares pero sin teléfono
     */
    public static UserResponseDTO suggestionView(User user) {
        return UserDTOMapper.toUserSuggestionResponseDTO(user);
    }

    // ========================================
    // FACTORY METHODS DE CONVENIENCIA
    // ========================================

    /**
     * Constructor desde User entity con vista completa
     * Mantiene compatibilidad con constructor anterior
     */
    public UserResponseDTO(User user) {
        this(UserDTOMapper.toUserFullResponseDTO(user));
    }

    private UserResponseDTO(UserResponseDTO delegate) {
        this(
            delegate.status(),
            delegate.profile(),
            delegate.privacy(),
            delegate.metrics(),
            delegate.matches(),
            delegate.auth(),
            delegate.account(),
            delegate.notifications()
        );
    }

    // ========================================
    // MÉTODOS DE CONVENIENCIA
    // ========================================

    /**
     * Obtiene el ID del usuario desde el complaintStatus
     */
    public Long id() {
        return profile != null ? profile.id() : null;
    }
}
