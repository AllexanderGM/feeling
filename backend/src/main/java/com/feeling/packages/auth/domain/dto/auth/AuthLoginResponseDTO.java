package com.feeling.packages.auth.domain.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.domain.dto.user.*;

/**
 * Respuesta de sesión generada después de autenticar al usuario.
 * <p>
 * Contiene el par de tokens y la proyección completa del usuario necesaria
 * para inicializar la sesión en clientes ricos.
 */
public record AuthLoginResponseDTO(
    @JsonView(AuthViews.Session.Basic.class)
    TokenResponseDTO tokens,

    @JsonView(AuthViews.Session.Basic.class)
    UserStatusDTO status,

    @JsonView(AuthViews.Session.Basic.class)
    UserDataDTO user,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonView(AuthViews.Session.Extended.class)
    UserPrivacyDTO privacy,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonView(AuthViews.Session.Extended.class)
    UserNotificationDTO notifications,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonView(AuthViews.Session.Full.class)
    UserPerformanceMetricsDTO metrics,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonView(AuthViews.Session.Full.class)
    UserMatchesDTO matches,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonView(AuthViews.Session.Full.class)
    AuthProviderInfoDTO auth
) {
}
