package com.feeling.packages.auth.domain.dto.verification;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;

/**
 * Estado resumido del progreso de onboarding de un usuario.
 *
 * @param email           Correo consultado.
 * @param fullyRegistered Indica si completó el flujo de registro.
 * @param verified        Indica si el correo fue verificado exitosamente.
 * @param profileComplete Indica si el perfil cumple el mínimo requerido.
 */
public record AuthUserStatusDTO(
    @JsonView(AuthViews.Verification.Basic.class)
    String email,

    @JsonView(AuthViews.Verification.Basic.class)
    boolean fullyRegistered,

    @JsonView(AuthViews.Verification.Basic.class)
    boolean verified,

    @JsonView(AuthViews.Verification.Basic.class)
    boolean profileComplete
) {
}
