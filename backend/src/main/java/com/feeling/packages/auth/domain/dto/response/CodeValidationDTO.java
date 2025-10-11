package com.feeling.packages.auth.domain.dto.response;

/**
 * Resultado de la validación de códigos de verificación.
 *
 * @param valid Indica si el código es válido
 * @param message Mensaje informativo que describe el resultado
 */
public record CodeValidationDTO(
    boolean valid,
    String message
) {
}
