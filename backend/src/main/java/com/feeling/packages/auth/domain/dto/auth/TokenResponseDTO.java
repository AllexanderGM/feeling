package com.feeling.packages.auth.domain.dto.auth;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;

/**
 * Par de tokens JWT emitidos por el servicio de autenticación.
 *
 * @param accessToken  Token de acceso de corta duración.
 * @param refreshToken Token de refresco utilizado para obtener nuevos tokens.
 */
public record TokenResponseDTO(
    @JsonView(AuthViews.Session.Basic.class)
    String accessToken,

    @JsonView(AuthViews.Session.Basic.class)
    String refreshToken
) {
}
