package com.feeling.packages.auth.domain.dto.verification;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.auth.domain.enums.AuthProvider;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Estado actual del proceso de verificación de un usuario específico.
 *
 * @param email                Correo del usuario evaluado.
 * @param exists               Indica si el usuario existe en la plataforma.
 * @param verified             Indica si la cuenta ya fue verificada.
 * @param profileComplete      Indica si el perfil cumple los requisitos mínimos.
 * @param authProvider         Proveedor de autenticación asociado (si existe).
 * @param codeExpirationMinutes Minutos restantes para que caduque el código vigente.
 */
public record UserVerificationStatusDTO(
    @JsonView(AuthViews.Verification.Basic.class)
    String email,

    @JsonView(AuthViews.Verification.Basic.class)
    boolean exists,

    @JsonView(AuthViews.Verification.Basic.class)
    boolean verified,

    @JsonView(AuthViews.Verification.Basic.class)
    boolean profileComplete,

    @JsonView(AuthViews.Verification.Extended.class)
    AuthProvider authProvider,

    @Schema(description = "Tiempo restante para expiración del código en minutos")
    @JsonView(AuthViews.Verification.Extended.class)
    Long codeExpirationMinutes
) {
}
