package com.feeling.packages.auth.domain.dto.verification;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.auth.domain.enums.AuthProvider;

import java.util.Set;

/**
 * Respuesta que indica si un correo puede usarse para registro.
 * <p>
 * Incluye mensajes de ayuda tanto para nuevos registros como para usuarios existentes.
 *
 * @param email                       Correo consultado.
 * @param available                   Indica si el correo está libre para registro.
 * @param existingAuthProvider        Proveedor actual cuando el correo ya está registrado.
 * @param message                     Mensaje contextual para mostrar al usuario.
 * @param availableRegistrationMethods Métodos disponibles para completar el registro.
 * @param loginInstruction            Instrucciones para iniciar sesión si el correo ya está en uso.
 */
public record EmailAvailabilityDTO(
    @JsonView(AuthViews.Verification.Basic.class)
    String email,

    @JsonView(AuthViews.Verification.Basic.class)
    boolean available,

    @JsonView(AuthViews.Verification.Basic.class)
    AuthProvider existingAuthProvider,

    @JsonView(AuthViews.Verification.Basic.class)
    String message,

    @JsonView(AuthViews.Verification.Basic.class)
    Set<AuthProvider> availableRegistrationMethods,

    @JsonView(AuthViews.Verification.Basic.class)
    String loginInstruction
) {
}
