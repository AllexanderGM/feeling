package com.feeling.packages.auth.domain.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.domain.dto.user.*;

/**
 * Proyección estándar del usuario utilizada por el dominio de autenticación.
 * <p>
 * Se alinea con las convenciones del módulo de usuarios, pero encapsula únicamente
 * la información necesaria para inicializar y mantener la sesión de autenticación.
 */
public record AuthUserView(
    @JsonView(AuthViews.Session.Basic.class)
    UserStatusDTO status,

    @JsonView(AuthViews.Session.Basic.class)
    UserDataDTO profile,

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
    AuthProviderInfoDTO authProvider
) {
}
