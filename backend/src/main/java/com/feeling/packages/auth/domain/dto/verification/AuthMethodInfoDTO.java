package com.feeling.packages.auth.domain.dto.verification;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.auth.domain.enums.AuthProvider;

import java.util.Set;

/**
 * Respuesta que describe el estado de autenticación de un correo.
 * <p>
 * Facilita al cliente saber si la cuenta existe, qué proveedor usa y
 * qué métodos alternativos están disponibles.
 *
 * @param email               Correo consultado.
 * @param currentAuthProvider Proveedor actualmente vinculado (puede ser {@code null}).
 * @param registered          Indica si existe una cuenta asociada al correo.
 * @param message             Mensaje informativo dirigido al usuario.
 * @param availableMethods    Métodos de autenticación habilitados para el correo.
 */
public record AuthMethodInfoDTO(
    @JsonView(AuthViews.Verification.Basic.class)
    String email,

    @JsonView(AuthViews.Verification.Basic.class)
    AuthProvider currentAuthProvider,

    @JsonView(AuthViews.Verification.Basic.class)
    boolean registered,

    @JsonView(AuthViews.Verification.Basic.class)
    String message,

    @JsonView(AuthViews.Verification.Basic.class)
    Set<AuthProvider> availableMethods
) {
}
