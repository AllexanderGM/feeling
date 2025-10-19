package com.feeling.packages.auth.domain.dto.auth;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.auth.domain.enums.AuthProvider;

import java.time.LocalDateTime;

/**
 * Información asociada al proveedor de autenticación externo del usuario.
 *
 * @param userAuthProvider  Proveedor OAuth asociado a la cuenta.
 * @param externalId        Identificador otorgado por el proveedor externo.
 * @param externalAvatarUrl URL del avatar definido en el proveedor (si aplica).
 * @param lastExternalSync  Fecha de la última sincronización con el proveedor.
 */
public record AuthProviderInfoDTO(
    @JsonView(AuthViews.Session.Basic.class)
    AuthProvider userAuthProvider,

    @JsonView(AuthViews.Session.Basic.class)
    String externalId,

    @JsonView(AuthViews.Session.Basic.class)
    String externalAvatarUrl,

    @JsonView(AuthViews.Session.Basic.class)
    LocalDateTime lastExternalSync
) {
}
