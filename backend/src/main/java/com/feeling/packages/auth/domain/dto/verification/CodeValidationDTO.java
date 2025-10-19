package com.feeling.packages.auth.domain.dto.verification;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;

/**
 * Resultado de la validación de códigos de verificación.
 *
 * @param valid   Indica si el código es válido.
 * @param message Mensaje informativo que describe el resultado.
 */
public record CodeValidationDTO(
    @JsonView(AuthViews.Verification.Basic.class)
    boolean valid,

    @JsonView(AuthViews.Verification.Basic.class)
    String message
) {
}
