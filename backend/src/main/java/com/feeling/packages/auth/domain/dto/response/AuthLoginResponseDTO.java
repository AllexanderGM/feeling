package com.feeling.packages.auth.domain.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserAccountStatusDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserDataDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserMatchesDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserStatusDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserNotificationDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserPrivacyDTO;

/**
 * Respuesta completa del flujo de login.
 * <p>
 * Proporciona todos los datos necesarios para inicializar la sesión del usuario
 * en clientes ricos (tokens, perfil, métricas, configuración y estado de cuenta).
 *
 * @param tokens        Par de tokens JWT emitidos para la sesión
 * @param status        Estado funcional del usuario (verificación, aprobación, rol)
 * @param profile       Información de perfil visible
 * @param privacy       Preferencias de privacidad configuradas
 * @param notifications Configuración de notificaciones del usuario
 * @param metrics       Métricas agregadas de la actividad del usuario
 * @param matches       Información de disponibilidad y estadísticas de matches
 * @param auth          Detalles del proveedor de autenticación vinculado
 * @param account       Estado administrativo de la cuenta (desactivaciones, motivos)
 */
public record AuthLoginResponseDTO(
    TokenPairDTO tokens,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserStatusDTO status,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserDataDTO profile,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserPrivacyDTO privacy,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserNotificationDTO notifications,
    UserPerformanceMetricsDTO metrics,
    UserMatchesDTO matches,
    AuthProviderInfoDTO auth,
    UserAccountStatusDTO account
) {

    /**
     * Constructor de conveniencia para mantener compatibilidad
     */
    public AuthLoginResponseDTO(String accessToken, String refreshToken,
                                UserStatusDTO status, UserDataDTO profile,
                                UserPrivacyDTO privacy, UserNotificationDTO notifications,
                                UserPerformanceMetricsDTO metrics, UserMatchesDTO matches,
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
